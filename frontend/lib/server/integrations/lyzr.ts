import { baseUrl,required,IntegrationError,env,lyzrAgentMode } from './config';
import { requestJson } from './http';
import { checkHealth } from './provider-health';
import type { AgentOrchestratorProvider } from './contracts';
export class LyzrProvider implements AgentOrchestratorProvider {
  private get modern() { return env('LYZR_API_MODE') !== 'v3'; }
  private base() { return baseUrl('LYZR_API_BASE_URL',this.modern&&!lyzrAgentMode()?'https://inference.studio.lyzr.ai':'https://agent-prod.studio.lyzr.ai'); }
  private url() { return this.base()+(this.modern?'/api/workflows/':'/v3/workflows/')+encodeURIComponent(required('LYZR_WORKFLOW_ID')); }
  async health() { return checkHealth('lyzr',async()=>{
    if(lyzrAgentMode()) {
      const agent=await requestJson<{_id:string;is_active:boolean;managed_agents?:unknown[]}>('Lyzr',this.base()+'/v3/agents/'+encodeURIComponent(required('LYZR_AGENT_ID')),{headers:{'x-api-key':required('LYZR_API_KEY')}});
      if(agent._id!==required('LYZR_AGENT_ID')||agent.is_active!==true)throw new IntegrationError('unavailable','Configured Lyzr agent is absent or inactive');
      return {agent:'…'+required('LYZR_AGENT_ID').slice(-4),detail:`Authenticated active agent read succeeded; ${Array.isArray(agent.managed_agents)?agent.managed_agents.length:0} configured managed agents. Inference and specialist execution are not verified by this probe.`};
    }
    const result=await requestJson<Record<string,unknown>>('Lyzr',this.url(),{headers:{'x-api-key':required('LYZR_API_KEY')}});
    if(!result || typeof result!=='object' || !result.flow_data) throw new IntegrationError('invalid_response','Lyzr workflow response missing flow_data');
    return {workflow:'…'+required('LYZR_WORKFLOW_ID').slice(-4),detail:'Authenticated workflow read succeeded; execution not tested by this read probe'};
  }); }
  async execute(input:Record<string,unknown>) {
    if(lyzrAgentMode()) {
      if(typeof input.execution_id!=='string'||typeof input.user_id!=='string')throw new IntegrationError('invalid_input','Agent execution and scoped user IDs required',400);
      const session_id=required('LYZR_AGENT_ID')+'-'+input.execution_id;
      const result=await requestJson<{response:unknown}>('Lyzr',this.base()+'/v3/inference/chat/',{method:'POST',headers:{'x-api-key':required('LYZR_API_KEY'),'Content-Type':'application/json'},body:JSON.stringify({user_id:input.user_id,agent_id:required('LYZR_AGENT_ID'),session_id,message:JSON.stringify(input)})},false,45000);
      let output=result.response;
      if(typeof output==='string'){try{output=JSON.parse(output);}catch{throw new IntegrationError('invalid_response','Lyzr agent response must be a JSON claims object; configure its output contract');}}
      if(!output||typeof output!=='object'||Array.isArray(output))throw new IntegrationError('invalid_response','Lyzr agent returned no structured object');
      return {output,session_id};
    }
    if(this.modern) {
      const headers={'x-api-key':required('LYZR_API_KEY'),'Content-Type':'application/json'};
      const accepted=await requestJson<{execution_id:string}>('Lyzr',this.base()+'/api/workflows/execute',{method:'POST',headers,body:JSON.stringify({workflow_id:required('LYZR_WORKFLOW_ID'),input:[input]})},false,10000);
      if(typeof accepted.execution_id!=='string'||!accepted.execution_id)throw new IntegrationError('invalid_response','Lyzr did not return an execution ID');
      const deadline=Date.now()+45000;
      while(Date.now()<deadline) {
        const run=await requestJson<{status:string;outputs:unknown;pending_approval?:unknown}>('Lyzr',this.base()+'/api/executions/'+encodeURIComponent(accepted.execution_id),{headers},false,5000);
        if(run.status==='completed')return {execution_id:accepted.execution_id,output:run.outputs};
        if(['failed','cancelled','paused'].includes(run.status)||run.pending_approval)throw new IntegrationError('unavailable','Lyzr execution stopped or awaits external approval; inspect Studio');
        if(run.status!=='running')throw new IntegrationError('invalid_response','Unknown Lyzr execution status');
        await new Promise(r=>setTimeout(r,1000));
      }
      throw new IntegrationError('unavailable','Lyzr execution exceeded the bounded wait; inspect Studio before retrying');
    }
    // Execution POST is NOT retried: Lyzr does not document an idempotency guarantee.
    const result=await requestJson<{status:string;output:unknown;execution_id?:string}>('Lyzr',this.url()+'/execute',{method:'POST',headers:{'x-api-key':required('LYZR_API_KEY'),'Content-Type':'application/json'},body:JSON.stringify({input_data:input})},false,45000);
    if(result.status!=='success' || !result.output) throw new IntegrationError('unavailable','Lyzr workflow did not return a successful structured output');
    return {output:result.output,execution_id:result.execution_id};
  }
}
