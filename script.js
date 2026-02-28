// ===============================
// HDIS – Frontend Controller
// ===============================
 
// Safe getter to avoid null crashes
function getValue(id, defaultValue = "") {
  const el = document.getElementById(id);
  return el ? el.value : defaultValue;
}

// -------------------------------
// MAIN ANALYZE FUNCTION
// -------------------------------
async function analyzeDecision() {

  const payload = {
    // Step 1 – Human State
    stress: Number(getValue("stress", 5)),
    time_pressure: Number(getValue("timePressure", 5)),
    info_overload: Number(getValue("infoOverload", 5)),
    fear_of_loss: Number(getValue("fearOfLoss", 5)),

    // Step 2 – Decision Context
    decision_type: getValue("decisionType", "General"),
    time_horizon: getValue("timeHorizon", "Medium-term"),
    risk_tolerance: getValue("riskTolerance", "Medium"),
    reversible: getValue("reversible", "Yes"),
    urgency: getValue("urgency", "No"),

    // Step 3 – Solutions
    solutions: []
  };

  // Collect 1–3 solutions safely
  ["solution1", "solution2", "solution3"].forEach(id => {
    const val = getValue(id);
    if (val.trim() !== "") {
      payload.solutions.push(val.trim());
    }
  });

  if (payload.solutions.length === 0) {
    alert("Please enter at least one solution.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    renderResults(data);

  } catch (error) {
    alert("Backend not reachable. Is the server running?");
    console.error(error);
  }
}

// -------------------------------
// RESULT RENDERER (STRUCTURED)
// -------------------------------
function renderResults(data) {
  const resultDiv = document.getElementById("result");

  let html = `
    <h3>🧠 HDIS – Deficiency Analysis</h3>
    <p><b>Decision Type:</b> ${data.decision_type}</p>
    <p><b>Solutions Analyzed:</b> ${data.solution_count}</p>
    <hr>
  `;

  data.analysis_results.forEach(solution => {

    // Risk color
    let riskColor = "#f59e0b"; // medium
    if (solution.deficiency_risk_percentage <= 35) riskColor = "#16a34a";
    if (solution.deficiency_risk_percentage >= 70) riskColor = "#dc2626";

    html += `
      <div style="
        margin-top:20px;
        padding:20px;
        border-radius:14px;
        background:#ffffff;
        box-shadow:0 10px 25px rgba(0,0,0,0.08);
        border-left:6px solid ${riskColor};
      ">
        <h4>Solution ${solution.solution_number}</h4>
        <p><b>User Proposal:</b> ${solution.solution_text}</p>

        <p style="
          margin-top:10px;
          font-weight:700;
          color:${riskColor};
        ">
          Deficiency Risk: ${solution.deficiency_risk_percentage}%
        </p>
    `;

    // Structured analysis blocks
    solution.deficiency_analysis.forEach(d => {
      html += `
        <div style="
          margin-top:12px;
          padding:12px;
          border-radius:10px;
          background:#f8fafc;
        ">
          <p><b>⚠ Risk:</b> ${d.risk}</p>
          <p><b>🧠 Reason:</b> ${d.reason}</p>
          <p><b>🛠 Adjustment:</b> ${d.adjustment}</p>
          <p><b>➡ Next Step:</b> ${d.next_step}</p>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `
    <div style="
      margin-top:25px;
      padding:16px;
      border-radius:12px;
      background:#eef2ff;
      font-weight:600;
    ">
      HDIS does not decide for you.  
      It identifies decision-making deficiencies and suggests corrective steps.
    </div>
  `;

  resultDiv.innerHTML = html;
}
