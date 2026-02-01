const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3sgmk9NHOJA3Nk6j_4V-8NBMt8VdHqZupreWNoL4xET8f03FhLPSv6zq-PyTPwnRTb1Tz8PzNNAXW/pub?gid=0&single=true&output=csv";

document.getElementById("load").addEventListener("click", async () => {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  document.getElementById("output").textContent = text;
});
