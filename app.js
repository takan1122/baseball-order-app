const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3sgmk9NHOJA3Nk6j_4V-8NBMt8VdHqZupreWNoL4xET8f03FhLPSv6zq-PyTPwnRTb1Tz8PzNNAXW/pub?gid=0&single=true&output=csv";

document.getElementById("load").addEventListener("click", async () => {
  const res = await fetch(SHEET_URL);
  const csvText = await res.text();

  const members = parseCSV(csvText);

  document.getElementById("output").textContent =
    JSON.stringify(members, null, 2);
});

/**
 * CSV文字列 → メンバー配列に変換
 */
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");

  const members = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const member = {
      name: values[0],
      positions: {}
    };

    for (let j = 1; j < headers.length; j++) {
      member.positions[headers[j]] = values[j];
    }

    members.push(member);
  }

  return members;
}
