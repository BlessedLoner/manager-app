// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout/Layout";
import MessageChart from "../components/Charts/MessageChart";
import CountryFilter from "../components/Filters/CountryFilter";
import DateRangeFilter from "../components/Filters/DateRangeFilter";

const COUNTRIES = [
  { code: "all", name: "All Countries" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ZA", name: "South Africa" },
];

export default function ManagerDashboard() {
  const [analytics, setAnalytics] = useState({
    totals: {
      sent: 0,
      reported: 0,
      responseRatio: 0,
      userMessages: 0,
      responses: 0,
    },
    chart: { labels: [], sent: [], responses: [], reported: [] },
  });
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [days, setDays] = useState(30);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCountry, days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/analytics?country=${selectedCountry}&days=${days}`,
      );
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Sent Messages",
      value: analytics.totals.sent.toLocaleString(),
      color: "bg-blue-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      title: "Total Reported Messages",
      value: analytics.totals.reported.toLocaleString(),
      color: "bg-red-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      title: "Total User Messages",
      value: analytics.totals.userMessages.toLocaleString(),
      color: "bg-green-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "Response Ratio",
      value: `${analytics.totals.responseRatio}%`,
      color: "bg-purple-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of platform analytics</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
          <CountryFilter
            countries={COUNTRIES}
            value={selectedCountry}
            onChange={setSelectedCountry}
          />
          <DateRangeFilter
            value={days}
            onChange={setDays}
            options={[
              { value: 7, label: "Last 7 days" },
              { value: 14, label: "Last 14 days" },
              { value: 30, label: "Last 30 days" },
            ]}
          />
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Message Activity
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Sent Messages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Responses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Reported</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <MessageChart
              labels={analytics.chart.labels}
              sentData={analytics.chart.sent}
              responseData={analytics.chart.responses}
              reportedData={analytics.chart.reported}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
