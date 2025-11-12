import React from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
}

export default function Table({ columns, data, loading }: TableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 px-4 text-sm text-gray-700">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}