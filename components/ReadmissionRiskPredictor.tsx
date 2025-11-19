"use client";

import React, { useState } from 'react';

// ======================== TYPE DEFINITIONS ========================
interface ReadmissionFormData {
  gender: string;
  age: number;
  ethnicity: string;
  admitDate: string;
  dischargeDate: string;
  isFirstStay: boolean;
  hospitalExpireFlag: boolean;
  icuDuration: number;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  wbcCount: number;
  plateletCount: number;
  creatinine: number;
  bilirubin: number;
  bun: number;
  glucose: number;
  map: number;
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;
  pao2Fio2: number;
  urineOutput: number;
  elixhauserScore: number;
}

interface PredictionResult {
  willBeReadmitted: boolean;
  probability: number;
  reasoning: string;
  scores: {
    sofa: number;
    sapsII: number;
    apsIII: number;
    mlods: number;
    sirs: number;
    elixhauserSID30: number;
  };
}

// ======================== EXAMPLES ========================
// ======================== EXAMPLE 1 – low RISK ========================
const lowRiskExample: ReadmissionFormData = {
  gender: 'Female',
  age: 74,
  ethnicity: 'Group 2', // encoded value you described
  admitDate: new Date().toISOString().split('T')[0],   // keep as today for UI
  dischargeDate: new Date().toISOString().split('T')[0],
  isFirstStay: false,           // Not first hospital stay (0)
  hospitalExpireFlag: false,    // No hospital death (0)

  // ICU stay duration
  icuDuration: 5,                // LOS ICU = 5 days

  // ======== VITALS ========
  heartRate: 110,               // bpm
  respiratoryRate: 28,          // breaths / min
  temperature: 100.2,           // Fahrenheit
  map: 68,                      // mmHg

  // ======== LAB RESULTS ========
  wbcCount: 16.2,
  plateletCount: 210,
  creatinine: 1.4,
  bun: 28,
  bilirubin: 0.7,
  glucose: 182,

  // ======== NEUROLOGICAL ========
  gcsEye: 4,
  gcsVerbal: 5,
  gcsMotor: 6,

  // ======== RESPIRATORY ========
  pao2Fio2: 180,                // ventilated P/F ratio

  // ======== RENAL ========
  urineOutput: 1600,            // mL/day

  // ======== COMORBIDITY INDEX ========
  elixhauserScore: 16,          // ELIXHAUSERSID30
};


// ======================== MOCK PREDICTION ========================
const mockPredictReadmission = (formData: ReadmissionFormData): PredictionResult => {
  const scores = {
  sofa: 7,
  sapsII: 32,
  apsIII: 48,
  mlods: 3,
  sirs: 2,
  elixhauserSID30: 16,
  };

  const riskFactors = [
    formData.age > 65,
    !formData.isFirstStay,
    formData.icuDuration > 5,
    formData.creatinine > 1.5,
    scores.sofa > 4,
    scores.sapsII > 25,
    scores.elixhauserSID30 > 5,
  ];

  const riskScore = riskFactors.filter(Boolean).length;
  const willBeReadmitted = riskScore >= 3;
  const probability = willBeReadmitted ? 0.34 : 0.12;

  const reasoning = willBeReadmitted
    ? `   Based on the provided data, it appears that the patient is a 74-year-old female with an ethnicity group of 2 who has had one ICU stay, with a hospitalization lasting 6 days and an ICU stay of 5 days. The patient has been diagnosed with acute respiratory failure due to COPD exacerbation, requiring BiPAP for a short period followed by invasive ventilation, and eventually extubated on the fourth day.

          The clinical scores suggest that the patient is critically ill, as indicated by high SOFA (7), SAPSII (32), APSIII (48), mLODS (3), and ELIXHAUSERSID30 (16) scores. The high SOFA score suggests multiple organ dysfunction, while the high SAPS II score indicates a high risk of mortality. The high APS III score suggests that the patient is in a severe condition.

          The laboratory results show an increased white blood cell count (16.2), decreased platelet count (210), and elevated creatinine level (1.4) indicating kidney impairment. The respiratory data shows a low PaO2/FiO2 ratio (180) suggesting hypoxemia, which is consistent with the diagnosis of acute respiratory failure.

          The neurological status indicates reduced consciousness as indicated by a low GCS score. The urine output of 1600 mL/day suggests that the kidneys are functioning at some level.

          Given the high-risk scores and the patient's critical condition, it is important to closely monitor the patient for any signs of deterioration and provide appropriate supportive care to manage complications.

          Regarding the similar cases, Case 1, Case 2, and Case 3 all involve elderly female patients with acute respiratory failure due to COPD exacerbation, requiring ICU stay and mechanical ventilation. The similarity score suggests that these cases are very similar to the current case.

          RISK=0.5|NOTE=The patient is at high risk of mortality due to severe acute respiratory failure, multiple organ dysfunction, and high-risk clinical scores. Close monitoring and appropriate supportive care are essential to manage complications and improve outcomes.`
    : `The patient’s overall condition appears stable with lower severity scores, suggesting a lower likelihood of readmission within 30 days.`;
  return { willBeReadmitted, probability, reasoning, scores };
};

// ======================== MAIN COMPONENT ========================
const ReadmissionRiskPredictor: React.FC = () => {
  const [formData, setFormData] = useState<ReadmissionFormData>(lowRiskExample);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(e.target.value === 'high' ? lowRiskExample : lowRiskExample);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = mockPredictReadmission(formData);
    setPrediction(result);
    setShowPrediction(true);
  };

  return (
    <section className="rounded-3xl p-5 bg-white divide-y divide-gray-100">
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-2xl font-medium">Readmission Risk Predictor</h2>
      </div>

      {!showPrediction ? (
        <form onSubmit={handleSubmit} className="pt-5 space-y-6">
          {/* ============== DEMOGRAPHICS ============== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Demographics</h3>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="block w-full border p-2 rounded-md"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="block w-full border p-2 rounded-md"
              />

              <label className="block text-sm font-medium text-gray-700">Ethnicity</label>
              <select
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleInputChange}
                className="block w-full border p-2 rounded-md"
              >
                <option value="Caucasian">Caucasian</option>
                <option value="Asian">Asian</option>
                <option value="Hispanic">Hispanic</option>
              </select>
            </div>

            {/* ============== HOSPITALIZATION ============== */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Hospitalization</h3>
              <label className="block text-sm font-medium text-gray-700">ICU Duration (days)</label>
              <input
                type="number"
                name="icuDuration"
                value={formData.icuDuration}
                onChange={handleInputChange}
                className="block w-full border p-2 rounded-md"
              />

              <label className="block text-sm font-medium text-gray-700">Admit Date</label>
              <input
                type="date"
                name="admitDate"
                value={formData.admitDate}
                onChange={handleInputChange}
                className="block w-full border p-2 rounded-md"
              />

              <label className="block text-sm font-medium text-gray-700">Discharge Date</label>
              <input
                type="date"
                name="dischargeDate"
                value={formData.dischargeDate}
                onChange={handleInputChange}
                className="block w-full border p-2 rounded-md"
              />
            </div>
          </div>

          {/* ============== VITALS & LABS ============== */}
          <div>
            <h3 className="text-lg font-medium border-b pb-2">Vitals & Labs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                'heartRate',
                'respiratoryRate',
                'temperature',
                'wbcCount',
                'plateletCount',
                'creatinine',
                'bilirubin',
                'bun',
                'glucose',
                'map',
                'pao2Fio2',
                'urineOutput',
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleInputChange}
                    className="block w-full border p-2 rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ============== COMORBIDITIES ============== */}
          <div>
            <h3 className="text-lg font-medium border-b pb-2">Comorbidities</h3>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Elixhauser Comorbidity Score</label>
              <input 
                type="number" 
                name="elixhauserScore"
                value={formData.elixhauserScore}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        
          {/* ============== DISCHARGE SUMMARY ============== */}
          <div className="mt-6">
            <h3 className="text-lg font-medium border-b pb-2">Discharge Summary</h3>

            <label className="block text-sm font-medium text-gray-700 mt-4">
              Upload Discharge Summary (PDF or TXT)
            </label>
            <input 
              type="file" 
              accept=".pdf,.txt" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="bg-teal-300 hover:bg-teal-500 text-black font-semibold px-12 py-4 rounded-full"
            >
              Predict Readmission Risk
            </button>
          </div>
        </form>
      ) : (
        <div className="pt-5">
          <div
            className={`p-6 rounded-xl ${
              prediction?.willBeReadmitted ? 'bg-red-50' : 'bg-green-50'
            } mb-6`}
          >
            <h3 className="text-xl font-bold mb-4">
              LLM Prediction: 30-day Readmission Probability
            </h3>

            <p className="text-2xl font-semibold text-teal-600 mb-4">
              {Math.round(prediction?.probability! * 100)}% likelihood of readmission
            </p>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium mb-2">Reasoning:</h4>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-gray-700 space-y-4 leading-relaxed">
                  {prediction?.reasoning
                    .split('\n')
                    .filter((p) => p.trim() !== '')
                    .map((p, i) => (
                      <p key={i}>{p.trim()}</p>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Clinical Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {prediction?.scores &&
                Object.entries(prediction.scores).map(([key, value]) => (
                  <div key={key} className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-sm">{key.toUpperCase()}</h4>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              onClick={() => setShowPrediction(false)}
              className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-12 py-4 rounded-full"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReadmissionRiskPredictor;