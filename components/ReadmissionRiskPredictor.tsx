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
// ======================== EXAMPLE 1 – HIGH RISK ========================
const highRiskExample: ReadmissionFormData = {
  gender: 'Male',
  age: 68,
  ethnicity: 'Caucasian',
  admitDate: new Date().toISOString().split('T')[0],
  dischargeDate: new Date().toISOString().split('T')[0],
  isFirstStay: false,
  hospitalExpireFlag: false,
  icuDuration: 7, // stayed in ICU for sepsis and AKI

  // Vitals / Labs
  heartRate: 92,
  respiratoryRate: 20,
  temperature: 99.1,
  wbcCount: 13.5,
  plateletCount: 180,
  creatinine: 1.9,
  bilirubin: 0.9,
  bun: 34,
  glucose: 150,
  map: 72,
  gcsEye: 4,
  gcsVerbal: 5,
  gcsMotor: 6,
  pao2Fio2: 280,
  urineOutput: 1300,

  // Comorbidity index
  elixhauserScore: 12,
};

const lowRiskExample: ReadmissionFormData = {
  gender: 'Female',
  age: 37,
  ethnicity: 'Caucasian',
  admitDate: new Date().toISOString().split('T')[0],
  dischargeDate: new Date().toISOString().split('T')[0],
  isFirstStay: true,
  hospitalExpireFlag: false,
  icuDuration: 2,
  heartRate: 80,
  respiratoryRate: 16,
  temperature: 98.4,
  wbcCount: 8.0,
  plateletCount: 270,
  creatinine: 0.9,
  bilirubin: 0.6,
  bun: 12,
  glucose: 100,
  map: 80,
  gcsEye: 4,
  gcsVerbal: 5,
  gcsMotor: 6,
  pao2Fio2: 350,
  urineOutput: 1500,
  elixhauserScore: 2,
};

// ======================== MOCK PREDICTION ========================
const mockPredictReadmission = (formData: ReadmissionFormData): PredictionResult => {
  const scores = {
    sofa: formData.creatinine > 1.5 ? 5 : 2,
    sapsII: Math.floor(10 + formData.age / 2),
    apsIII: Math.floor(20 + formData.bun / 2),
    mlods: Math.floor(formData.creatinine + formData.bilirubin / 2),
    sirs: formData.temperature > 100.4 ? 3 : 1,
    elixhauserSID30: formData.elixhauserScore,
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
    ? `T Based on the provided data, it appears that the patient is a 74-year-old female with an ethnicity group of 2 who has had one ICU stay, with a hospitalization lasting 6 days and an ICU stay of 5 days. The patient has been diagnosed with acute respiratory failure due to COPD exacerbation, requiring BiPAP for a short period followed by invasive ventilation, and eventually extubated on the fourth day.

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
  const [formData, setFormData] = useState<ReadmissionFormData>(highRiskExample);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(e.target.value === 'high' ? highRiskExample : lowRiskExample);
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
        <select
          onChange={handleExampleChange}
          className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50"
        >
          <option value="high">Example 1 – High Risk (68M)</option>
          <option value="low">Example 2 – Low Risk (37F)</option>
        </select>
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
            <h3 className="text-lg font-medium border-b pb-2 mt-6">Comorbidities</h3>
            <label className="block text-sm font-medium text-gray-700">
              Elixhauser Comorbidity Score
            </label>
            <input
              type="number"
              name="elixhauserScore"
              value={formData.elixhauserScore}
              onChange={handleInputChange}
              className="block w-full border p-2 rounded-md"
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
              <p className="text-gray-700">{prediction?.reasoning}</p>
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