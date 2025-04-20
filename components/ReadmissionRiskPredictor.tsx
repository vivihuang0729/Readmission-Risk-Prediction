'use client';
import React, { useState } from 'react';
import { formatDate } from './utils/formatDate';

// Types for form data
interface ReadmissionFormData {
  // Demographics
  gender: string;
  age: number;
  ethnicity: string;

  // Hospitalization
  admitDate: string;
  dischargeDate: string;
  isFirstStay: boolean;
  hospitalExpireFlag: boolean;
  icuDuration: number;

  // Vitals/Labs
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  wbcCount: number;
  plateletCount: number;
  creatinine: number;
  bilirubin: number;
  bun: number;
  glucose: number;
  map: number; // Mean Arterial Pressure
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;
  pao2Fio2: number;
  urineOutput: number;

  // Comorbidities
  elixhauserScore: number;
}

interface PredictionResult {
  willBeReadmitted: boolean;
  reasoning: string;
  scores: {
    sofa: number;
    sapsII: number;
    apsIII: number;
    mlods: number;
    sirs: number;
    elixhauserSID30: number;
  }
}

const initialFormData: ReadmissionFormData = {
  gender: 'Female',
  age: 65,
  ethnicity: 'Caucasian',
  admitDate: new Date().toISOString().split('T')[0],
  dischargeDate: new Date().toISOString().split('T')[0],
  isFirstStay: false,
  hospitalExpireFlag: false,
  icuDuration: 3,
  heartRate: 85,
  respiratoryRate: 18,
  temperature: 98.6,
  wbcCount: 9.5,
  plateletCount: 250,
  creatinine: 1.1,
  bilirubin: 0.8,
  bun: 15,
  glucose: 110,
  map: 75,
  gcsEye: 4,
  gcsVerbal: 5,
  gcsMotor: 6,
  pao2Fio2: 300,
  urineOutput: 1200,
  elixhauserScore: 4
};

// Mock prediction function that would connect to an LLM API in production
const mockPredictReadmission = (formData: ReadmissionFormData): PredictionResult => {
  // Calculate mock scores based on input data
  const calculateMockScores = () => ({
    sofa: Math.floor(2 + (formData.age / 20) + (formData.creatinine * 2)),
    sapsII: Math.floor(10 + (formData.age / 10) + (formData.icuDuration * 2)),
    apsIII: Math.floor(20 + (formData.age / 5) + (formData.bun / 2)),
    mlods: Math.floor(formData.creatinine + (formData.bilirubin / 2)),
    sirs: formData.temperature > 100.4 || formData.temperature < 96.8 ? 2 : 1,
    elixhauserSID30: formData.elixhauserScore
  });

  const scores = calculateMockScores();
  
  // Mock risk calculation based on various factors
  const riskFactors = [
    formData.age > 65,
    !formData.isFirstStay,
    formData.icuDuration > 5,
    formData.creatinine > 1.5,
    scores.sofa > 5,
    scores.sapsII > 30,
    scores.elixhauserSID30 > 5
  ];
  
  const riskScore = riskFactors.filter(Boolean).length;
  const willBeReadmitted = riskScore >= 3;
  
  // Generate reasoning based on risk factors
  let reasoning = willBeReadmitted ? 
    `Based on analysis of the patient's data, there is a significant risk of readmission within 30 days. Key factors include ${formData.age > 65 ? 'advanced age, ' : ''}${!formData.isFirstStay ? 'previous hospitalization, ' : ''}${formData.icuDuration > 5 ? 'extended ICU stay, ' : ''}${formData.creatinine > 1.5 ? 'elevated creatinine levels, ' : ''}${scores.sofa > 5 ? 'high SOFA score, ' : ''}${scores.sapsII > 30 ? 'concerning SAPS-II probability, ' : ''}${scores.elixhauserSID30 > 5 ? 'multiple comorbidities ' : ''} that collectively suggest a need for enhanced post-discharge care planning and follow-up.` :
    `The patient appears to have a lower risk of readmission based on the provided clinical parameters. The relatively ${formData.age <= 65 ? 'younger age, ' : ''}${formData.isFirstStay ? 'first hospital admission, ' : ''}${formData.icuDuration <= 5 ? 'shorter ICU stay, ' : ''}${formData.creatinine <= 1.5 ? 'normal kidney function, ' : ''}${scores.sofa <= 5 ? 'lower SOFA score, ' : ''} and ${scores.elixhauserSID30 <= 5 ? 'fewer comorbidities ' : ''} suggest a favorable post-discharge trajectory. Standard follow-up care is recommended.`;
  
  return { willBeReadmitted, reasoning, scores };
};

const ReadmissionRiskPredictor: React.FC = () => {
  const [formData, setFormData] = useState<ReadmissionFormData>(initialFormData);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? Number(value)
          : value
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
      <div className="flex items-center pb-5">
        <h2 className="text-2xl font-medium">Readmission Risk Predictor</h2>
      </div>
      
      {!showPrediction ? (
        <form onSubmit={handleSubmit} className="pt-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demographics Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Demographics</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Ethnicity</label>
                <select 
                  name="ethnicity" 
                  value={formData.ethnicity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Caucasian">Caucasian</option>
                  <option value="African American">African American</option>
                  <option value="Hispanic">Hispanic</option>
                  <option value="Asian">Asian</option>
                  <option value="Native American">Native American</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Hospitalization Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Hospitalization</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admit Date</label>
                <input 
                  type="date" 
                  name="admitDate"
                  value={formData.admitDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Discharge Date</label>
                <input 
                  type="date" 
                  name="dischargeDate"
                  value={formData.dischargeDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isFirstStay"
                  name="isFirstStay"
                  checked={formData.isFirstStay}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-300"
                />
                <label htmlFor="isFirstStay" className="text-sm font-medium text-gray-700">First Hospital Stay</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="hospitalExpireFlag"
                  name="hospitalExpireFlag"
                  checked={formData.hospitalExpireFlag}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-300"
                />
                <label htmlFor="hospitalExpireFlag" className="text-sm font-medium text-gray-700">Hospital Expire Flag</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">ICU Duration (days)</label>
                <input 
                  type="number" 
                  name="icuDuration"
                  value={formData.icuDuration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Vitals/Labs Section */}
          <div>
            <h3 className="text-lg font-medium border-b pb-2">Vitals & Labs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Heart Rate</label>
                <input 
                  type="number" 
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Respiratory Rate</label>
                <input 
                  type="number" 
                  name="respiratoryRate"
                  value={formData.respiratoryRate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Temperature (°F)</label>
                <input 
                  type="number" 
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">WBC Count</label>
                <input 
                  type="number" 
                  name="wbcCount"
                  value={formData.wbcCount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Platelet Count</label>
                <input 
                  type="number" 
                  name="plateletCount"
                  value={formData.plateletCount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Creatinine</label>
                <input 
                  type="number" 
                  name="creatinine"
                  value={formData.creatinine}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Bilirubin</label>
                <input 
                  type="number" 
                  name="bilirubin"
                  value={formData.bilirubin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">BUN</label>
                <input 
                  type="number" 
                  name="bun"
                  value={formData.bun}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Glucose</label>
                <input 
                  type="number" 
                  name="glucose"
                  value={formData.glucose}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">MAP</label>
                <input 
                  type="number" 
                  name="map"
                  value={formData.map}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">GCS Eye</label>
                  <input 
                    type="number" 
                    name="gcsEye"
                    min="1"
                    max="4"
                    value={formData.gcsEye}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GCS Verbal</label>
                  <input 
                    type="number" 
                    name="gcsVerbal"
                    min="1"
                    max="5"
                    value={formData.gcsVerbal}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GCS Motor</label>
                  <input 
                    type="number" 
                    name="gcsMotor"
                    min="1"
                    max="6"
                    value={formData.gcsMotor}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">PaO2/FiO2</label>
                <input 
                  type="number" 
                  name="pao2Fio2"
                  value={formData.pao2Fio2}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Urine Output (mL/day)</label>
                <input 
                  type="number" 
                  name="urineOutput"
                  value={formData.urineOutput}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Comorbidities Section */}
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
          <div className={`p-6 rounded-xl ${prediction?.willBeReadmitted ? 'bg-red-50' : 'bg-green-50'} mb-6`}>
            <h3 className="text-xl font-bold mb-4">
              LLM Prediction: Will the patient be readmitted?
              <span className={`ml-2 ${prediction?.willBeReadmitted ? 'text-red-500' : 'text-green-500'}`}>
                {prediction?.willBeReadmitted ? 'Yes' : 'No'}
              </span>
            </h3>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium mb-2">Reasoning:</h4>
              <p className="text-gray-700">{prediction?.reasoning}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Clinical Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {prediction?.scores && Object.entries(prediction.scores).map(([key, value]) => (
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