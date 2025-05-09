// A basic React app for entering, approving, and generating reports of vouchers with Excel export and user authentication
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

export default function VoucherApp() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({ amount: '', description: '', date: '' });
  const [reportRange, setReportRange] = useState({ start: '', end: '' });
  const [showReport, setShowReport] = useState(false);
  const [userRole, setUserRole] = useState('submitter'); // roles: submitter, approver

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReportChange = (e) => {
    setReportRange({ ...reportRange, [e.target.name]: e.target.value });
  };

  const addVoucher = () => {
    if (!form.amount || !form.date || !form.description) return;
    setVouchers([...vouchers, { ...form, approved: false, id: Date.now() }]);
    setForm({ amount: '', description: '', date: '' });
  };

  const approveVoucher = (id) => {
    setVouchers(vouchers.map(v => v.id === id ? { ...v, approved: true } : v));
  };

  const filteredReport = vouchers.filter(v => {
    const date = new Date(v.date);
    return (
      new Date(reportRange.start) <= date &&
      date <= new Date(reportRange.end)
    );
  });

  const exportToExcel = () => {
    const data = filteredReport.map(v => ({
      Date: v.date,
      Amount: v.amount,
      Description: v.description,
      Status: v.approved ? 'Approved' : 'Pending'
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'voucher_report.xlsx');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Voucher Management</h1>

      <div className="flex items-center gap-4">
        <span className="font-medium">Logged in as:</span>
        <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="border px-2 py-1 rounded">
          <option value="submitter">Submitter</option>
          <option value="approver">Approver</option>
        </select>
      </div>

      {userRole === 'submitter' && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-xl font-semibold">Enter Voucher</h2>
            <Input name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} />
            <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <Input name="date" type="date" value={form.date} onChange={handleChange} />
            <Button onClick={addVoucher}>Add Voucher</Button>
          </CardContent>
        </Card>
      )}

      {userRole === 'approver' && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xl font-semibold">Pending Vouchers</h2>
            {vouchers.filter(v => !v.approved).map(v => (
              <div key={v.id} className="flex justify-between items-center">
                <div>{v.description} - ${v.amount} on {v.date}</div>
                <Button onClick={() => approveVoucher(v.id)}>Approve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">Generate Report</h2>
          <div className="flex gap-4">
            <Input name="start" type="date" value={reportRange.start} onChange={handleReportChange} />
            <Input name="end" type="date" value={reportRange.end} onChange={handleReportChange} />
            <Button onClick={() => setShowReport(true)}>Generate</Button>
          </div>
          {showReport && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Report Results</h3>
              {filteredReport.length === 0 && <p>No vouchers found.</p>}
              {filteredReport.map(v => (
                <div key={v.id} className="border p-2 rounded">
                  {v.description} - ${v.amount} on {v.date} ({v.approved ? 'Approved' : 'Pending'})
                </div>
              ))}
              <Button className="mt-4" onClick={exportToExcel}>Export to Excel</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
