'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';
import { Search, Download, ArrowUpDown, Shield, Clock, RefreshCw } from 'lucide-react';

export interface LoginEventItem {
  id: string;
  user_id: string | null;
  email: string;
  login_method: string;
  user_agent: string | null;
  ip_address: string | null;
  success: boolean;
  created_at: string;
  isNew?: boolean;
}

interface Props {
  initialRows: LoginEventItem[];
}

export default function LoginActivityClient({ initialRows }: Props) {
  const [rows, setRows] = useState<LoginEventItem[]>(initialRows);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortField, setSortField] = useState<'created_at' | 'email' | 'login_method'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('en-IN'));
  }, []);

  // ── Supabase Realtime Listener ──────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('login-events-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'login_events' },
        (payload) => {
          const newRow = payload.new as LoginEventItem;
          newRow.isNew = true;

          setRows((prev) => [newRow, ...prev]);
          setLastUpdated(new Date().toLocaleTimeString('en-IN'));

          // Remove the highlight flag after 1.5s
          setTimeout(() => {
            setRows((prev) =>
              prev.map((r) => (r.id === newRow.id ? { ...r, isNew: false } : r))
            );
          }, 1500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Filtering and Sorting ───────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.email.toLowerCase().includes(q) ||
          (r.ip_address && r.ip_address.toLowerCase().includes(q)) ||
          (r.user_agent && r.user_agent.toLowerCase().includes(q))
      );
    }

    if (methodFilter !== 'all') {
      result = result.filter((r) => r.login_method === methodFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === 'login_method') {
        comparison = a.login_method.localeCompare(b.login_method);
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [rows, searchTerm, methodFilter, sortField, sortAsc]);

  // ── Excel Export (SheetJS) ──────────────────────────────────────────────────
  const handleExport = (exportAll = false) => {
    const targetRows = exportAll ? rows : filteredRows;

    const worksheet = XLSX.utils.json_to_sheet(
      targetRows.map((r) => ({
        'Timestamp (IST)': new Date(r.created_at).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        }),
        'User Email': r.email,
        'Auth Method': r.login_method,
        'Status': r.success ? 'Success' : 'Failed',
        'IP Address': r.ip_address || 'N/A',
        'Browser / Device': r.user_agent || 'Unknown',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Login Activity');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filterTag = exportAll ? 'all' : 'filtered';
    XLSX.writeFile(workbook, `loanfit-login-activity-${filterTag}-${dateStr}.xlsx`);
  };

  const toggleSort = (field: 'created_at' | 'email' | 'login_method') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div
        className="p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by email, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md outline-none"
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-md outline-none"
            style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Methods</option>
            <option value="password">Password</option>
            <option value="otp">OTP</option>
            <option value="google">Google OAuth</option>
            <option value="magic_link">Magic Link</option>
          </select>
        </div>

        {/* Status & Export Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {filteredRows.length}
            </span>{' '}
            of {rows.length} rows · Updated {lastUpdated || 'now'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-white transition-colors"
              style={{ background: 'var(--navy-600)' }}
              title="Export currently filtered view to Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .xlsx</span>
            </button>
            {searchTerm || methodFilter !== 'all' ? (
              <button
                onClick={() => handleExport(true)}
                className="px-3 py-2 rounded-md text-xs font-medium transition-colors"
                style={{
                  background: 'var(--navy-050)',
                  color: 'var(--navy-600)',
                  border: '1px solid var(--navy-150)',
                }}
                title="Export all rows to Excel"
              >
                Export All
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Spreadsheet-Style Table */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead
              className="sticky top-0 z-20"
              style={{ background: 'var(--navy-950)', color: 'white' }}
            >
              <tr>
                <th
                  onClick={() => toggleSort('created_at')}
                  className="sticky left-0 z-30 p-3.5 font-semibold cursor-pointer select-none"
                  style={{ background: 'var(--navy-950)', minWidth: '180px' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Timestamp (IST)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('email')}
                  className="p-3.5 font-semibold cursor-pointer select-none"
                  style={{ minWidth: '220px' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>User Email</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('login_method')}
                  className="p-3.5 font-semibold cursor-pointer select-none"
                  style={{ minWidth: '130px' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Method</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="p-3.5 font-semibold" style={{ minWidth: '90px' }}>
                  Status
                </th>
                <th className="p-3.5 font-semibold" style={{ minWidth: '130px' }}>
                  IP Address
                </th>
                <th className="p-3.5 font-semibold" style={{ minWidth: '260px' }}>
                  Client / User Agent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    No login events match the current filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => {
                  const isEven = idx % 2 === 0;
                  const rowBg = r.isNew
                    ? 'rgba(78, 164, 204, 0.25)' // Highlight fade
                    : isEven
                    ? 'var(--bg-surface)'
                    : 'var(--navy-050)';

                  return (
                    <tr
                      key={r.id}
                      style={{
                        background: rowBg,
                        transition: 'background 400ms ease-out',
                      }}
                      className="hover:opacity-90"
                    >
                      {/* Sticky First Column */}
                      <td
                        className="sticky left-0 z-10 p-3 font-mono tabular-nums text-[11px]"
                        style={{
                          background: rowBg,
                          color: 'var(--text-primary)',
                          borderRight: '1px solid var(--border-subtle)',
                        }}
                      >
                        {new Date(r.created_at).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="p-3 font-mono text-[11px]" style={{ color: 'var(--text-primary)' }}>
                        {r.email}
                      </td>
                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded-xs text-[10px] font-medium"
                          style={{
                            background: 'var(--navy-050)',
                            color: 'var(--navy-600)',
                            border: '1px solid var(--navy-150)',
                          }}
                        >
                          {r.login_method}
                        </span>
                      </td>
                      <td className="p-3">
                        {r.success ? (
                          <span
                            className="px-2 py-0.5 rounded-xs text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200"
                          >
                            Success
                          </span>
                        ) : (
                          <span
                            className="px-2 py-0.5 rounded-xs text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200"
                          >
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {r.ip_address || '—'}
                      </td>
                      <td
                        className="p-3 text-[11px] truncate max-w-xs"
                        style={{ color: 'var(--text-muted)' }}
                        title={r.user_agent || ''}
                      >
                        {r.user_agent || 'Unknown'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
