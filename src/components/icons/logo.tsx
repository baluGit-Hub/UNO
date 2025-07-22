import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center -space-x-8">
        <div
          className="w-16 h-24 bg-blue-500 rounded-lg shadow-lg transform -rotate-12 border-4 border-white dark:border-slate-800"
          style={{boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}}
        />
        <div
          className="w-16 h-24 bg-red-500 rounded-lg shadow-lg transform rotate-6 z-10 border-4 border-white dark:border-slate-800"
           style={{boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}}
        />
        <div
          className="w-16 h-24 bg-yellow-400 rounded-lg shadow-lg transform rotate-12 border-4 border-white dark:border-slate-800"
           style={{boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}}
        />
      </div>
      <h1 className="text-6xl font-bold font-headline text-primary">Card Party</h1>
    </div>
  );
}
