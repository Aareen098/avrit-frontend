import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCompanyJobs, getPublicJobs } from "@/api/jobs.api";
import Icon from "@/components/common/Icon";

export default function Careers() {
  const [search, setSearch] = useState("");
  // /c/:slug shows one company's openings; /careers shows every company's.
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-jobs", slug ?? "all"],
    queryFn: () => (slug ? getCompanyJobs(slug) : getPublicJobs()),
    retry: false,
  });
  const jobs = (slug ? data?.jobs : data) ?? [];
  const companyName = slug ? data?.company?.name : null;
  const q = search.trim().toLowerCase();
  const shown = jobs.filter((j) => !q || `${j.title} ${j.department} ${j.location}`.toLowerCase().includes(q));

  return (
    <div>
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">{companyName ? `Join ${companyName}` : "Join our team"}</h1>
        <p className="mt-2 text-slate-500">Find a role that fits you and apply in a few minutes.</p>
        <div className="relative mx-auto mt-6 max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, team or location"
            aria-label="Search openings"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
          />
        </div>
      </div>

      <div className="mt-10 space-y-3">
        {isLoading ? (
          <p className="text-center text-slate-500">Loading openings...</p>
        ) : isError && slug ? (
          <div className="text-center">
            <p className="text-lg font-semibold">We could not find this company.</p>
            <Link to="/careers" className="mt-3 inline-block text-primary">See all openings</Link>
          </div>
        ) : isError ? (
          <p className="text-center text-red-600">Could not load openings. Please try again later.</p>
        ) : shown.length === 0 ? (
          <p className="text-center text-slate-500">No openings match your search.</p>
        ) : (
          shown.map((j) => (
            <Link
              key={j.id}
              to={`/careers/${j.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                {!slug && j.companyName && <p className="text-xs font-medium text-primary">{j.companyName}</p>}
                <p className="font-semibold">{j.title}</p>
                <p className="mt-1 text-sm text-slate-500">{j.department} · {j.location} · {j.type}</p>
              </div>
              <Icon name="arrow_forward" className="text-slate-400" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}