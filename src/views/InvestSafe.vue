<template>
  <div class="investsafe-page">
    <div class="container">

      <!-- ===== Top Two Panels ===== -->
      <div class="top-section">

        <!-- Left: Investment Scam Awareness -->
        <div class="card">
          <h2>Investment Scam Aware</h2>

          <label>Scam Type</label>
          <select v-model="selectedType" @change="loadPrevention(selectedType)">
            <option>Superannuation</option>
            <option>Crypto</option>
            <option>Bank Deposit</option>
          </select>

          <!-- Prevention Info -->
          <div v-if="preventionData">
            <h3>{{ preventionData.title || (selectedType + ' prevention') }}</h3>

            <!-- Summary -->
            <div class="summary">
              <img src="/warning-icon.png" alt="warning" />
              <div>
                <p><b>{{ preventionData.category }}</b></p>
                <p>
                  {{ preventionData.description || preventionData.summary || preventionData.steps?.[0]?.text }}
                </p>
              </div>
            </div>

            <!-- Checklist -->
            <div class="checklist">
              <img src="/lightbulb.png" alt="tip" />
              <div>
                <ul>
                  <li v-for="(step, i) in preventionData.steps" :key="i">
                    {{ typeof step === 'string' ? step : step.text }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Links -->
            <p v-if="preventionData.situation_link">
              🔗
              <a :href="preventionData.situation_link" target="_blank">
                Example Situation
              </a>
            </p>
            <p v-if="preventionData.mitigation_link">
              🛡️
              <a :href="preventionData.mitigation_link" target="_blank">
                Mitigation Advice
              </a>
            </p>
          </div>

          <p v-if="preventionError" style="color:red">
            {{ preventionError }}
          </p>
        </div>

<!-- ===== Company Validation ===== -->
<div class="card">
  <h2>Company Validation</h2>

  <!-- === Company name search === -->
  <label>Company Name</label>
  <div class="flex-row">
    <input
      v-model="companyName"
      type="text"
      placeholder="e.g. Commonwealth Bank"
    />
    <button
      class="btn-blue"
      @click="verifyCompany"
      :disabled="loadingCompany"
    >
      {{ loadingCompany ? "Checking..." : "Search" }}
    </button>
  </div>

  <!-- === ACN verification === -->
  <label>ACN</label>
  <div class="flex-row">
    <input v-model="acn" type="text" placeholder="e.g. 000000019" />
    <button
      class="btn-blue"
      @click="verifyAcn"
      :disabled="loadingAcn"
    >
      {{ loadingAcn ? "Loading..." : "Verify" }}
    </button>
  </div>

  <!-- === Result box === -->
  <div v-if="companyResult" class="company-box">
    <p class="company-name">
      {{ companyResult.name || "Unknown Company" }}
    </p>
    <p
      class="registered"
      :style="{ color: companyResult.registered ? '#2ecc71' : '#e74c3c' }"
    >
      {{ companyResult.registered ? "Registered ✅" : "Unregistered ❌" }}
    </p>
    <p v-if="companyResult.registration_date">
      Registration date: {{ companyResult.registration_date }}
    </p>
    <p>Source: ASIC</p>
  </div>

  <p v-if="acnError" style="color:red">{{ acnError }}</p>
  <p v-if="companyError" style="color:red">{{ companyError }}</p>
</div>

      </div>

      <!-- ===== Bottom Section: Link Checker ===== -->
      <div class="bottom-section">
        <div class="card card-bottom">
          <h2>Link Checker</h2>

          <div class="flex-row">
            <input v-model="link" type="text" placeholder="Enter link" />
            <button
              class="btn-blue"
              @click="verifyLink"
              :disabled="loadingDomain"
            >
              {{ loadingDomain ? "Checking..." : "Verify" }}
            </button>
          </div>

          <div
            v-if="domainResult"
            class="status"
            :class="['status', domainResult.verdict === 'clean' ? 'green' : 'red']"
          >
            Status:
            {{ domainResult.verdict === 'clean' ? "Safe ✅" : "Flagged ⚠️" }}
          </div>

          <p v-if="domainError" style="color:red">
            {{ domainError }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import {
  epic6CheckAcn,
  epic6CheckName,
  epic7LinkCheck,
  epic7Prevention
} from "../services/api";

// ======= Reactive State =======
const selectedType = ref("Superannuation");
const companyName = ref("");
const acn = ref("");
const link = ref("");

const companyResult = ref(null);
const domainResult = ref(null);
const preventionData = ref(null);

const loadingAcn = ref(false);
const loadingCompany = ref(false);
const loadingDomain = ref(false);

const acnError = ref("");
const companyError = ref("");
const domainError = ref("");
const preventionError = ref("");

// ======= ACN checker =======
const verifyAcn = async () => {
  if (!acn.value) return;
  loadingAcn.value = true;
  acnError.value = "";
  try {
    const res = await epic6CheckAcn(acn.value);
    console.log("🔍 ACN backend response:", res);
    if (res && Array.isArray(res.results) && res.results.length > 0) {
      const first = res.results[0];
      companyResult.value = {
        name:
          first.name ||
          first["Company Name"] ||
          first.raw?.["Company Name"] ||
          "Unknown Company",
        registered:
          first.registration_status === "REGD" ||
          first["Registration Status"] === "REGD" ||
          first.raw?.Status === "REGD",
        registration_date:
          first.registration_date ||
          first["Date of Registration"] ||
          first.raw?.["Date of Registration"] ||
          null,
      };
    } else {
      acnError.value = "No company found for this ACN.";
      companyResult.value = null;
    }
  } catch (err) {
    acnError.value = err.message;
    companyResult.value = null;
  } finally {
    loadingAcn.value = false;
  }
};

// ======= Company Name checker =======
const verifyCompany = async () => {
  if (!companyName.value) return;
  loadingCompany.value = true;
  companyError.value = "";
  try {
    const res = await epic6CheckName(companyName.value);
    console.log("🔍 Backend raw response:", res);

    if (Array.isArray(res.results) && res.results.length > 0) {
      const first = res.results[0];
      companyResult.value = {
        name: first.name || first["Company Name"],
        registered:
          first.registration_status === "REGD" ||
          first["Registration Status"] === "REGD" ||
          first.raw?.Status === "REGD",
        registration_date:
          first.registration_date ||
          first["Date of Registration"] ||
          first.raw?.["Date of Registration"] ||
          null,
      };
    } else {
      companyError.value = "No company found.";
    }
  } catch (err) {
    companyError.value = err.message;
  } finally {
    loadingCompany.value = false;
  }
};

// ======= Link checker =======
const verifyLink = async () => {
  if (!link.value) return;
  loadingDomain.value = true;
  domainError.value = "";
  try {
    const cleanDomain = link.value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");
    console.log("🔍 Cleaned domain:", cleanDomain);

    const res = await epic7LinkCheck(cleanDomain);
    console.log("🔍 Backend response:", res);

    if (res) {
      const verdict =
        res.verdict?.toLowerCase?.() ||
        (res.matched === false ? "clean" : "flagged") ||
        "flagged";
      domainResult.value = {
        domain: cleanDomain,
        verdict,
        evidence: res.evidence || null,
      };
    } else {
      domainError.value = "No result from backend.";
    }
  } catch (err) {
    domainError.value = err.message || "Backend error – please try again.";
  } finally {
    loadingDomain.value = false;
  }
};

// ======= Prevention Info Loader =======
const loadPrevention = async (category) => {
  preventionError.value = "";
  preventionData.value = null;
  try {
    const backendMap = {
      Superannuation: "Superannuation scams",
      "Bank Deposit": "Bank Deposit",
      Crypto: "Crypto",
    };

    const backendCategory = backendMap[category] || category;
    console.log("🧠 Fetching prevention for:", backendCategory);

    const res = await epic7Prevention(encodeURIComponent(backendCategory));
    console.log("🧩 Prevention response:", res);

    if (res && (res.steps || res.title)) {
      preventionData.value = res;
    } else {
      const fallbackData = {
        "Superannuation scams": {
          category: "Superannuation scams",
          title: "Superannuation scams prevention",
          steps: [
            { text: "Do not act on unsolicited offers; verify using official super fund channels." },
            { text: "Check ASIC registers and MoneySmart for legitimacy." },
          ],
          situation_link:
            "https://moneysmart.gov.au/managing-your-money/superannuation",
          mitigation_link: "https://moneysmart.gov.au/how-super-works",
        },
        "Bank Deposit": {
          category: "Bank Deposit",
          title: "Bank Deposit prevention",
          steps: [
            { text: "Banks will never ask you to transfer money to a ‘safe account’." },
            { text: "Call your bank using the number on their official website." },
          ],
          situation_link:
            "https://www.cyber.gov.au/report-and-recover/recover-from-scams",
          mitigation_link: "https://www.cyber.gov.au/report-and-recover",
        },
      };

      preventionData.value =
        fallbackData[backendCategory] || {
          category: backendCategory,
          title: `${backendCategory} prevention (no data available)`,
          steps: [{ text: "No prevention content available yet." }],
        };
    }
  } catch (err) {
    preventionError.value = err.message || "Failed to load prevention info.";
  }
};

onMounted(() => {
  loadPrevention(selectedType.value);
});
</script>

<style scoped>
/* ===== Overall Layout ===== */
.investsafe-page {
  font-family: "Noto Sans", sans-serif;
  background: #eaf5ea;
  min-height: 100vh;
  padding: 80px 20px;
  display: flex;
  justify-content: center;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 1400px;
  width: 100%;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 3px;
  width: 100%;
}

.bottom-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* ===== Card Style ===== */
.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  flex: 1 1 48%;
  max-width: 48%;
  box-sizing: border-box;
}

.card-bottom {
  flex: 1 1 100%;
  max-width: 100%;
}

/* ===== Typography ===== */
h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

h3 {
  font-size: 16px;
  margin: 18px 0 10px;
  font-weight: 700;
}

label {
  display: block;
  font-weight: 600;
  margin-top: 28px;
  margin-bottom: 10px;
}

/* ===== Inputs ===== */
input,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
}

/* ===== Buttons ===== */
button {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-blue {
  background: #1e9fff;
  color: white;
  flex-shrink: 0;
}

.btn-blue:hover {
  background: #108be0;
}


/* ===== Section Separation ===== */
.card .flex-row + label {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 18px;
}

/* ===== Company Info Box ===== */
.company-box {
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f8f9fa;
  padding: 14px;
  margin-top: 8px;
}

.company-name {
  font-weight: bold;
  color: #333;
}

.registered {
  color: #2ecc71;
  font-weight: 600;
}

/* ===== Status Label ===== */
.status {
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 15px;
}
.status.red {
  background: #e74c3c;
}
.status.green {
  background: #2ecc71;
}

/* ===== Responsive Design ===== */
@media (max-width: 1024px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }
  .card {
    flex: 1 1 100%;
    max-width: 90%;
  }
  .card-bottom {
    width: 90%;
  }
}

@media (max-width: 600px) {
  .flex-row {
    flex-direction: column;
    align-items: stretch;
  }
  .flex-row button {
    width: 100%;
  }
  label {
    margin-top: 24px;
  }
}
/* ===== Flexible row alignment for input + button ===== */
.flex-row {
  display: flex !important; /* Force flex layout */
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%; /* Ensure full width in card */
}

/* Let input take all remaining space */
.flex-row input {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0; /* Prevent overflow shrinking */
}

/* Button stays consistent size and height */
.flex-row button {
  flex-shrink: 0;
  height: 42px;
  padding: 10px 18px;
  width: auto;
}

/* ===== Responsive adjustment (mobile & tablet) ===== */
@media (max-width: 768px) {
  .flex-row {
    flex-direction: column;
    align-items: stretch;
  }

  .flex-row input,
  .flex-row button {
    width: 100% !important; /* Force equal width on small screens */
  }
}

/* Optional hover enhancement for better UX */
.btn-blue:hover {
  background: #108be0;
  box-shadow: 0 0 6px rgba(30, 159, 255, 0.5); /* Soft blue glow */
  transition: box-shadow 0.3s ease;
}

</style>
