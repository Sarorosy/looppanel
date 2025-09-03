import { CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";

const DemoDoneAlready = ({ info }) => {
    const [demos, setDemos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDemos = async () => {
            if (!info?.email_id || !info?.website_id) {
                setDemos([]);
                return;
            }

            setLoading(true);

            try {
                const response = await fetch(
                    "https://loopback-skci.onrender.com/api/scope/selectrefidsfordemodone",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: info.email_id,
                            website_id: info.website_id,
                        }),
                    }
                );

                const data = await response.json();

                if (data.status === "success" && data.demos?.length > 0) {
                    // Remove duplicates by demo_id
                    const uniqueDemosMap = new Map();
                    data.demos.forEach(demo => {
                        if (!uniqueDemosMap.has(demo.demo_id)) {
                            uniqueDemosMap.set(demo.demo_id, demo);
                        }
                    });
                    setDemos(Array.from(uniqueDemosMap.values()));
                } else {
                    setDemos([]);
                }
            } catch (error) {
                console.error("Error fetching demos:", error);
                setDemos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDemos();
    }, [info]);

    if (!info?.email_id || !info?.website_id) return null;
    if (loading) return null;
    if (!demos.length) return null;

    return (
        <div>
            <p className="bg-green-600 px-1 py-0.5 rounded text-white w-fit flex items-center">
                <CheckCircle2 size={13} className="mr-1" />
                Demo(s) Already Done in Other Website
            </p>
            {demos.length > 0 && (
  <div className="overflow-x-auto my-2">
    <table className="min-w-full border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 border">Demo ID</th>
          <th className="px-4 py-2 border">Duration</th>
          <th className="px-4 py-2 border">Date</th>
        </tr>
      </thead>
      <tbody>
        {demos.map((demo, index) => (
          <tr key={index} className="text-center">
            <td className="px-4 py-2 border">{demo.demo_id}</td>
            <td className="px-4 py-2 border">{demo.demo_duration || "N/A"}</td>
            <td className="px-4 py-2 border">
              {demo.demo_date
                ? new Date(demo.demo_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        </div>
    );
};

export default DemoDoneAlready;
