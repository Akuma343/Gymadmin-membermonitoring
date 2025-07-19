// --- Data ---
let stats = [
  { label: "Total Members", value: 6, sub: "Active memberships" },
  { label: "Active Members", value: 3, sub: "Currently active" },
  { label: "Expiring Soon", value: 2, sub: "Within 30 days" },
  { label: "Expired", value: 1, sub: "Needs renewal" },
  { label: "Member List", value: 6, sub: "All members" },
];

let members = [
  // Active (registered recently, within last 27 days)
  {
    name: "Alice Carter",
    type: "Regular",
    email: "alice.carter@email.com",
    phone: "+1 (555) 101-2020",
    registered: "2025-07-10", // Active
    notes: ""
  },
  {
    name: "Brian Lee",
    type: "Student",
    email: "brian.lee@email.com",
    phone: "+1 (555) 303-4040",
    registered: "2025-07-01", // Active
    notes: ""
  },
  {
    name: "Emily Davis",
    type: "Regular",
    email: "emily.davis@email.com",
    phone: "+1 (555) 111-2222",
    registered: "2025-07-15", // Active
    notes: ""
  },
  // Expiring (registered 28-30 days ago)
  {
    name: "Cynthia Gomez",
    type: "Graveyard",
    email: "cynthia.gomez@email.com",
    phone: "+1 (555) 505-6060",
    registered: "2025-06-19", // Expiring (expires 2025-07-19)
    notes: ""
  },
  {
    name: "Frank Moore",
    type: "Student",
    email: "frank.moore@email.com",
    phone: "+1 (555) 222-3333",
    registered: "2025-06-18", // Expiring (expires 2025-07-18)
    notes: ""
  },
  // Expired (registered over a month ago)
  {
    name: "David Kim",
    type: "Regular",
    email: "david.kim@email.com",
    phone: "+1 (555) 707-8080",
    registered: "2025-05-10", // Expired
    notes: ""
  }
];

// --- Collapsible State ---
let sectionState = {
  expiringSoon: true,
  active: true,
  expired: true,
  memberList: true
};



// --- Rendering ---
function renderStats() {
  // Update stats based on members
  stats[0].value = members.length;
  stats[1].value = members.filter(m => getMemberStatus(m) === "Active").length;
  stats[2].value = members.filter(m => getMemberStatus(m) === "Expiring").length;
  stats[3].value = members.filter(m => getMemberStatus(m) === "Expired").length;
  stats[4].value = members.length; // Total members for member list

  const statsDiv = document.getElementById('stats-cards');
  statsDiv.innerHTML = stats.map((stat, idx) => `
    <div class="stats-card" data-section="${idx}">
      <div class="label">${stat.label}</div>
      <div class="value">${stat.value}</div>
      <div class="sub">${stat.sub}</div>
    </div>
  `).join('');
}

const sectionStatusMap = {
  active: "Active",
  expiringSoon: "Expiring",
  expired: "Expired"
};

function renderMembersSection(filter = "", showKeys = ['expiringSoon', 'active', 'expired']) {
  const sections = [
    { key: 'expiringSoon', title: 'Members Expiring Soon', color: 'yellow', titleClass: '' },
    { key: 'active', title: 'Active Members', color: 'green', titleClass: 'green' },
    { key: 'expired', title: 'Expired Members', color: 'red', titleClass: 'red' },
    { key: 'memberList', title: 'All Members (Alphabetical)', color: 'gray', titleClass: 'gray' }
  ];
  const sectionStatusMap = {
    active: "Active",
    expiringSoon: "Expiring",
    expired: "Expired",
    memberList: "All"
  };
  const container = document.getElementById('members-sections');
  container.innerHTML = sections
    .filter(section => showKeys.includes(section.key))
    .map(section => {
      let filtered = members.filter(m =>
        m.name.toLowerCase().includes(filter) ||
        m.email.toLowerCase().includes(filter) ||
        m.phone.toLowerCase().includes(filter)
      );
      
      if (section.key === 'memberList') {
        // For member list, show all members sorted alphabetically by last name
        filtered = filtered.sort((a, b) => {
          const aLastName = a.name.split(' ').slice(1).join(' ');
          const bLastName = b.name.split(' ').slice(1).join(' ');
          return aLastName.localeCompare(bLastName);
        });
      } else {
        // For other sections, filter by status
        filtered = filtered.filter(m => getMemberStatus(m) === sectionStatusMap[section.key]);
      }
      
      return `
        <div class="section ${section.color}" style="margin-bottom:40px;">
          <div class="section-title ${section.titleClass} section-header" 
               data-section="${section.key}" style="cursor:pointer;user-select:none;">
            <span style="font-size:18px;margin-right:8px;">
              ${sectionState[section.key] ? "▼" : "►"}
            </span>
            ${section.title}
            <span class="count">${filtered.length}</span>
          </div>
          <div class="members-list" id="list-${section.key}" style="display:${sectionState[section.key] ? "flex" : "none"};">
            ${filtered.map(member => memberCard(member)).join('')}
          </div>
        </div>
      `;
    }).join('');

  // Add click listeners for toggling
  document.querySelectorAll('.section-header').forEach(header => {
    header.onclick = function() {
      const key = this.getAttribute('data-section');
      sectionState[key] = !sectionState[key];
      renderMembersSection(document.getElementById('search').value.toLowerCase(), showKeys);
      setupDeleteButtons();
      setupNoteButtons();
    };
  });
  setupDeleteButtons();
  setupNoteButtons();
}

function getInitials(name) {
  return '👤'; // Person icon instead of initials
}

function formatNameForDisplay(name) {
  const nameParts = name.split(' ');
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    return `${lastName}, ${firstName}`;
  }
  return name; // Return as is if only one name part
}

function getExpiryDate(registered) {
  if (!registered) return '';
  const regDate = new Date(registered);
  // Add one month
  regDate.setMonth(regDate.getMonth() + 1);
  // Format as YYYY-MM-DD
  return regDate.toISOString().split('T')[0];
}

function getMemberStatus(member) {
  const today = new Date();
  const expiry = new Date(getExpiryDate(member.registered));
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Expired";
  } else if (diffDays <= 3) {
    return "Expiring";
  } else {
    return "Active";
  }
}

// --- Update memberCard function ---
function memberCard(member) {
  let status = getMemberStatus(member);
  let statusClass = '';
  if (status === "Active") statusClass = 'status-active';
  else if (status === "Expiring") statusClass = 'status-expiring';
  else statusClass = 'status-expired';

  const noteDisplay = member.notes ? member.notes : 'No notes';
  const noteClass = member.notes ? 'has-notes' : 'no-notes';

  return `
    <div class="member-card">
      <button class="delete-btn card-delete-btn" data-email="${member.email}" title="Delete">
        Delete
      </button>
      <div class="member-header">
        <div class="avatar">${getInitials(member.name)}</div>
        <div class="member-info">
          <div>
            <span>${formatNameForDisplay(member.name)}</span>
            <div class="member-type">${member.type ? member.type : ''}</div>
          </div>
        </div>
        <span class="member-status ${statusClass}">${status}</span>
      </div>
      <div class="member-details">${member.email}</div>
      <div class="member-details">${member.phone}</div>
      <div class="member-details">Registered: ${member.registered}</div>
      <div class="member-details">Expires: ${getExpiryDate(member.registered)}</div>
      <div class="member-notes">
        <div class="notes-header">
          <span class="notes-label">Notes:</span>
          <button class="edit-notes-btn" data-email="${member.email}" title="Edit Notes">
            ✏️
          </button>
        </div>
        <div class="notes-content ${noteClass}">${noteDisplay}</div>
      </div>
    </div>
  `;
}

// --- Modal Logic ---
function showModal(show) {
  document.getElementById('modal-bg').style.display = show ? 'flex' : 'none';
  if (!show) document.getElementById('add-member-form').reset();
}

function showNoteModal(show, memberEmail = null) {
  const modal = document.getElementById('note-modal-bg');
  modal.style.display = show ? 'flex' : 'none';
  
  if (show && memberEmail) {
    const member = members.find(m => m.email === memberEmail);
    if (member) {
      document.getElementById('note-member-name').textContent = formatNameForDisplay(member.name);
      document.getElementById('member-notes').value = member.notes || '';
    }
  } else if (!show) {
    document.getElementById('edit-notes-form').reset();
  }
}

// --- Event Listeners ---
document.getElementById('search').addEventListener('input', function(e) {
  renderMembersSection(e.target.value.toLowerCase());
});

document.getElementById('add-member-btn').addEventListener('click', function() {
  showModal(true);
});
document.getElementById('close-modal').addEventListener('click', function() {
  showModal(false);
});
document.getElementById('add-member-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const firstname = document.getElementById('member-firstname').value;
  const lastname = document.getElementById('member-lastname').value;
  const name = `${firstname} ${lastname}`;
  const type = document.getElementById('member-type').value;
  const email = document.getElementById('member-email').value;
  const phone = document.getElementById('member-phone').value;
  const registered = document.getElementById('member-registered').value;

  // Confirmation dialog
  const confirmMsg = `Add new member?\n\nFirst Name: ${firstname}\nLast Name: ${lastname}\nType: ${type}\nEmail: ${email}\nPhone: ${phone}\nRegistered: ${registered}`;
  if (!confirm(confirmMsg)) {
    return;
  }

  // Add to active members
  members.push({ name, type, email, phone, registered, notes: "" });

  // Increment "New This Month"
  stats[4].value = (parseInt(stats[4].value) || 0) + 1;

  showModal(false);
  renderStats();
  renderMembersSection(document.getElementById('search').value.toLowerCase());
  setupStatsCardClicks();
  setupDeleteButtons();
});

// Note editing event listeners
document.getElementById('close-note-modal').addEventListener('click', function() {
  showNoteModal(false);
});

document.getElementById('edit-notes-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const notes = document.getElementById('member-notes').value;
  const formattedMemberName = document.getElementById('note-member-name').textContent;
  
  // Find member by matching the original name format
  const member = members.find(m => formatNameForDisplay(m.name) === formattedMemberName);
  
  if (member) {
    member.notes = notes;
    showNoteModal(false);
    renderMembersSection(document.getElementById('search').value.toLowerCase());
    setupDeleteButtons();
    setupNoteButtons();
  }
});

// --- Handle delete button clicks ---
function setupDeleteButtons() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = function() {
      const email = this.getAttribute('data-email');
      if (confirm('Are you sure you want to delete this member?')) {
        // Remove from all member lists
        members = members.filter(m => m.email !== email);
        renderStats();
        renderMembersSection(document.getElementById('search').value.toLowerCase());
        setupDeleteButtons();
        setupNoteButtons();
      }
    };
  });
}

// --- Handle note editing button clicks ---
function setupNoteButtons() {
  document.querySelectorAll('.edit-notes-btn').forEach(btn => {
    btn.onclick = function() {
      const email = this.getAttribute('data-email');
      showNoteModal(true, email);
    };
  });
}

function showOnlySection(sectionIdx) {
  // 0: Total Members (show all), 1: Active, 2: Expiring Soon, 3: Expired, 4: Member List (show all alphabetically)
  let showKeys;
  if (sectionIdx === "1") showKeys = ['active'];
  else if (sectionIdx === "2") showKeys = ['expiringSoon'];
  else if (sectionIdx === "3") showKeys = ['expired'];
  else if (sectionIdx === "4") showKeys = ['memberList'];
  else showKeys = ['active', 'expiringSoon', 'expired'];

  renderMembersSection(document.getElementById('search').value.toLowerCase(), showKeys);
}

function setupStatsCardClicks() {
  document.querySelectorAll('.stats-card').forEach(card => {
    card.onclick = function() {
      const sectionIdx = this.getAttribute('data-section');
      showOnlySection(sectionIdx);
    };
  });
}

// --- Initial Render ---
renderStats();
setupStatsCardClicks();
renderMembersSection();
setupDeleteButtons();
setupNoteButtons();
