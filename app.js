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
      投手: "hope", 捕手: "ng",   一塁: "ok",
      二塁: "ng",   遊撃: "ng",   三塁: "ng",
      左翼: "ng",   中堅: "ng",   右翼: "ng",
      DH:   "ng",
    }
  },
  {
    name: "山本",
    positions: {
      投手: "ng",   捕手: "hope", 一塁: "ng",
      二塁: "ng",   遊撃: "ng",   三塁: "ok",
      左翼: "ng",   中堅: "ng",   右翼: "ng",
      DH:   "ok",
    }
  },
  {
    name: "鈴木",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "hope",
      二塁: "ng",   遊撃: "ng",   三塁: "ng",
      左翼: "ng",   中堅: "ng",   右翼: "ok",
      DH:   "ok",
    }
  },
  {
    name: "中村",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ng",
      二塁: "hope", 遊撃: "ok",   三塁: "ng",
      左翼: "ng",   中堅: "ng",   右翼: "ng",
      DH:   "ng",
    }
  },
  {
    name: "高橋",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ng",
      二塁: "ng",   遊撃: "hope", 三塁: "ok",
      左翼: "ng",   中堅: "ng",   右翼: "ng",
      DH:   "ng",
    }
  },
  {
    name: "田中",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ng",
      二塁: "ng",   遊撃: "ng",   三塁: "ng",
      左翼: "hope", 中堅: "ok",   右翼: "ng",
      DH:   "ok",
    }
  },
  {
    name: "伊藤",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ng",
      二塁: "ng",   遊撃: "ng",   三塁: "ng",
      左翼: "ng",   中堅: "hope", 右翼: "ok",
      DH:   "ok",
    }
  },
  {
    name: "渡辺",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ok",
      二塁: "ng",   遊撃: "ng",   三塁: "hope",
      左翼: "ng",   中堅: "ng",   右翼: "ng",
      DH:   "ng",
    }
  },
  {
    name: "小林",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ng",
      二塁: "ok",   遊撃: "ng",   三塁: "ng",
      左翼: "hope", 中堅: "ng",   右翼: "ng",
      DH:   "ok",
    }
  },
  {
    name: "加藤",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ng",
      二塁: "ng",   遊撃: "ng",   三塁: "ng",
      左翼: "ng",   中堅: "ok",   右翼: "hope",
      DH:   "ok",
    }
  },
  {
    name: "吉田",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ng",
      二塁: "ng",   遊撃: "ng",   三塁: "ng",
      左翼: "ok",   中堅: "ng",   右翼: "hope",
      DH:   "hope",
    }
  },
  {
    name: "山田",
    positions: {
      投手: "ng",   捕手: "ng",   一塁: "ok",
      二塁: "hope", 遊撃: "ng",   三塁: "ng",
      左翼: "ng",   中堅: "ng",   右翼: "ng",
      DH:   "ng",
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

    // ① 希望者
    let candidates = remainingMembers.filter(
      m => m.positions[position] === "hope"
    );

    // ② 希望がいなければ可能
    if (candidates.length === 0) {
      candidates = remainingMembers.filter(
        m => m.positions[position] === "ok"
      );
    }

    // ③ それでもいなければ失敗
    if (candidates.length === 0) {
      return { ok: false, reason: `${position} を守れる人がいません` };
    }

    // ④ 抽選
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
