const APP_TITLE = "草野球オーダー決定アプリ（試作）";
const APP_VERSION = "v0.1.1";

const manualAssignments = {
  投手: "佐藤",
  捕手: null,
  一塁: "鈴木",
  二塁: null,
  遊撃: null,
  三塁: null,
  左翼: null,
  中堅: null,
  右翼: null,
};

const members = [
  {
    name: "佐藤",
    positions: {
      投手: true,  捕手: false, 一塁: true,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "山本",
    positions: {
      投手: false, 捕手: true,  一塁: false,
      二塁: false, 遊撃: false, 三塁: true,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "鈴木",
    positions: {
      投手: false, 捕手: false, 一塁: true,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: false, 中堅: false, 右翼: true,
    }
  },
  {
    name: "中村",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: true,  遊撃: true,  三塁: false,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "高橋",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: false, 遊撃: true,  三塁: true,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "田中",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: true,  中堅: true,  右翼: false,
    }
  },
  {
    name: "伊藤",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: false, 中堅: true,  右翼: true,
    }
  },
  {
    name: "渡辺",
    positions: {
      投手: false, 捕手: false, 一塁: true,
      二塁: false, 遊撃: false, 三塁: true,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "小林",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: true,  遊撃: false, 三塁: false,
      左翼: true,  中堅: false, 右翼: false,
    }
  },
  {
    name: "加藤",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: false, 中堅: true,  右翼: true,
    }
  },
  {
    name: "吉田",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: true,  中堅: false, 右翼: true,
    }
  },
  {
    name: "山田",
    positions: {
      投手: false, 捕手: false, 一塁: true,
      二塁: true,  遊撃: false, 三塁: false,
      左翼: false, 中堅: false, 右翼: false,
    }
  }
];

function renderResult(assignments, dhMembers) {
  const tableBody = document.getElementById("defenseTable");
  const dhList = document.getElementById("dhList");

  // 初期化
  tableBody.innerHTML = "";
  dhList.innerHTML = "";

  // 守備表
  for (const [position, name] of Object.entries(assignments)) {
    const tr = document.createElement("tr");

    const tdPosition = document.createElement("td");
    tdPosition.textContent = position;

    const tdName = document.createElement("td");
    tdName.textContent = name ?? "—";

    tr.appendChild(tdPosition);
    tr.appendChild(tdName);
    tableBody.appendChild(tr);
  }

  // DH候補
  if (dhMembers.length === 0) {
    const li = document.createElement("li");
    li.textContent = "なし";
    dhList.appendChild(li);
  } else {
    dhMembers.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      dhList.appendChild(li);
    });
  }
}

function pickRandom(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
function getEmptyPositions(manualAssignments) {
  return Object.keys(manualAssignments)
    .filter(position => manualAssignments[position] == null);
}

function getUnusedMembers(manualAssignments, members) {
  const usedNames = new Set(
    Object.values(manualAssignments).filter(Boolean)
  );
  return members.filter(m => !usedNames.has(m.name));
}

function autoAssign(emptyPositions, availableMembers) {
  const assignments = {};
  let remainingMembers = [...availableMembers];

  for (const position of emptyPositions) {
    const candidates = remainingMembers.filter(
      m => m.positions[position] === true
    );

    if (candidates.length === 0) {
      return { ok: false, reason: `${position} を守れる人がいません` };
    }

    const selected = candidates.length === 1
      ? candidates[0]
      : pickRandom(candidates);

    assignments[position] = selected.name;
    remainingMembers = remainingMembers.filter(
      m => m.name !== selected.name
    );
  }

  return { ok: true, assignments, remainingMembers };
}

function runAssignment() {
  const emptyPositions = getEmptyPositions(manualAssignments);
  const availableMembers = getUnusedMembers(manualAssignments, members);

  // レアポジション優先
  emptyPositions.sort((a, b) => {
    const countA = availableMembers.filter(m => m.positions[a]).length;
    const countB = availableMembers.filter(m => m.positions[b]).length;
    return countA - countB;
  });

  const result = autoAssign(emptyPositions, availableMembers);

  if (!result.ok) {
    alert(result.reason);
    return false;
  }

  const finalAssignments = {
    ...manualAssignments,
    ...result.assignments
  };

  const dhMembers = result.remainingMembers.map(m => m.name);

  renderResult(finalAssignments, dhMembers);
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const loadBtn = document.getElementById("loadMembersBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");

  loadBtn.addEventListener("click", () => {
    const ok = runAssignment();
    if (ok) {
      shuffleBtn.disabled = false;
    }
  });

  shuffleBtn.addEventListener("click", () => {
    runAssignment();
  });
});
