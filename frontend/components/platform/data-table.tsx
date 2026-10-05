export function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="thin-scrollbar overflow-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[640px] border-collapse text-base">
        <thead className="sticky top-0 bg-slate-900 text-left text-sm uppercase tracking-wide text-slate-400">
          <tr>{columns.map((column) => <th scope="col" key={column} className="px-4 py-3">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/10 hover:bg-white/[0.04]">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-top text-slate-200">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
