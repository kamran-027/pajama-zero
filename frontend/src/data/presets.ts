// Pre-loaded realistic EHR in-basket preset messages and baseline JEV System One triage results
export interface PatientMessage {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  mrn: string;
  subject: string;
  body: string;
  timestamp: string;
  relevant_history?: string;
  active_medications: string[];
}

export interface JevTriageResult {
  message_id: string;
  patient_name: string;
  mrn: string;
  subject: string;
  snippet: string;
  lane: string;
  lane_title: string;
  lane_badge_color: string;
  acuity_score: number;
  requires_physician_license: boolean;
  clinical_rationale: string;
  delegated_to: string;
  action_plan: string;
  pre_drafted_action: string;
  latency_ms: number;
  token_cost_usd: number;
  evaluated_by: string;
  timestamp: string;
}

export interface BatchResponse {
  results: JevTriageResult[];
  total_messages: number;
  physician_queue_count: number;
  deflected_count: number;
  physician_deflection_rate: number;
  total_latency_ms: number;
  average_latency_ms: number;
  total_cost_usd: number;
  estimated_gpt4_cost_usd: number;
  pajama_time_saved_minutes: number;
  lane_distribution?: Record<string, number>;
}

export const INITIAL_PRESETS: PatientMessage[] = [
  {
    "id": "msg_001",
    "patient_name": "Robert Chen",
    "patient_age": 62,
    "patient_gender": "M",
    "mrn": "MRN-84920",
    "subject": "Tight chest pressure and feeling dizzy",
    "body": "Dr. Reynolds, I was out mowing the lawn about 45 minutes ago and started getting this tight, heavy squeezing pressure in the center of my chest. It radiates a little into my left shoulder and jaw. Broke into a cold sweat. Sat down with some water but it isn't easing up. Should I wait till tomorrow or come by the clinic?",
    "timestamp": "Today, 8:42 PM",
    "relevant_history": "CAD s/p stent (2021), Hypertension, Hyperlipidemia",
    "active_medications": [
      "Aspirin 81mg",
      "Atorvastatin 40mg",
      "Metoprolol Succinate 50mg"
    ]
  },
  {
    "id": "msg_002",
    "patient_name": "Maria Rodriguez",
    "patient_age": 47,
    "patient_gender": "F",
    "mrn": "MRN-72314",
    "subject": "Medication Refill: Atorvastatin 20mg",
    "body": "Hello, I am down to my last 3 tablets of Atorvastatin 20mg. Can you please authorize a 90-day refill to my usual Walgreens on El Camino Real? My lipid panel was checked at my annual wellness exam last month and was normal. Thank you!",
    "timestamp": "Today, 8:15 PM",
    "relevant_history": "Hyperlipidemia, Hypothyroidism",
    "active_medications": [
      "Atorvastatin 20mg",
      "Levothyroxine 75mcg"
    ]
  },
  {
    "id": "msg_003",
    "patient_name": "David Miller",
    "patient_age": 54,
    "patient_gender": "M",
    "mrn": "MRN-65829",
    "subject": "Left knee is swollen and stiff after playing pickleball",
    "body": "Hi Doctor, 4 days ago I twisted my left knee during a pickleball match. It didn't pop, but by next morning it was visibly swollen, warm, and stiff when bearing weight. I've been doing RICE and taking Aleve, but walking down stairs is quite painful. Can you send in a strong anti-inflammatory or tell me what to do?",
    "timestamp": "Today, 7:50 PM",
    "relevant_history": "Mild Osteoarthritis, No prior knee surgeries",
    "active_medications": [
      "Naproxen 500mg PRN",
      "Daily Multivitamin"
    ]
  },
  {
    "id": "msg_004",
    "patient_name": "Elena Rostova",
    "patient_age": 38,
    "patient_gender": "F",
    "mrn": "MRN-91204",
    "subject": "Biopsy Results in portal: High Grade Lesion (CIN-3)",
    "body": "Dr. Reynolds, I just received an alert that my cervical punch biopsy pathology report was uploaded to MyChart. It says 'Cervical Intraepithelial Neoplasia Grade 3 (CIN-3) with positive endocervical margins'. I am extremely anxious and scared about whether this means cancer and what the next surgical steps are. Can you please call me or explain what this means?",
    "timestamp": "Today, 7:22 PM",
    "relevant_history": "HPV positive, Abnormal Pap (ASC-H)",
    "active_medications": []
  },
  {
    "id": "msg_005",
    "patient_name": "James Wilson",
    "patient_age": 71,
    "patient_gender": "M",
    "mrn": "MRN-33418",
    "subject": "Thank you!",
    "body": "Just wanted to send a quick note of thanks to Dr. Reynolds and Nurse Sarah. The antibiotic eye drops cleared up that conjunctivitis within 48 hours. Eye feels completely back to normal. Have a wonderful weekend!",
    "timestamp": "Today, 6:58 PM",
    "relevant_history": "Type 2 Diabetes, Glaucoma",
    "active_medications": [
      "Metformin 1000mg BID",
      "Latanoprost ophthalmic"
    ]
  },
  {
    "id": "msg_006",
    "patient_name": "Sarah Jenkins",
    "patient_age": 29,
    "patient_gender": "F",
    "mrn": "MRN-44912",
    "subject": "Work Excuse Note for Monday & Tuesday",
    "body": "Hi clinic staff, I suffered a debilitating migraine attack on Monday that left me bedridden with light sensitivity and vomiting through Tuesday. My employer requires a signed doctor's note for unexcused medical absences exceeding 24 hours. Can the clinic provide a standard work release note for Oct 12-13? Thank you!",
    "timestamp": "Today, 6:30 PM",
    "relevant_history": "Chronic Migraine with Aura",
    "active_medications": [
      "Sumatriptan 50mg PRN",
      "Propranolol 40mg"
    ]
  },
  {
    "id": "msg_007",
    "patient_name": "Arthur Pendelton",
    "patient_age": 68,
    "patient_gender": "M",
    "mrn": "MRN-18239",
    "subject": "Right arm feels numb and slurred speech",
    "body": "Hello Dr. Reynolds, my husband Arthur asked me to write this because his right hand feels suddenly heavy and numb, and when he tried to answer the phone earlier his speech sounded mumbled and thick. He says he feels fine otherwise and doesn't want to make a fuss, but it's been about 30 minutes now. Should we come into clinic tomorrow morning?",
    "timestamp": "Today, 6:05 PM",
    "relevant_history": "Atrial Fibrillation, Prior TIA (2019), Hypertension",
    "active_medications": [
      "Eliquis 5mg BID",
      "Lisinopril 20mg"
    ]
  },
  {
    "id": "msg_008",
    "patient_name": "Chloe Vance",
    "patient_age": 33,
    "patient_gender": "F",
    "mrn": "MRN-55201",
    "subject": "Request for Wegovy / Zepbound Prescription",
    "body": "Hi Dr. Reynolds! A coworker of mine lost 35 pounds on Wegovy and I would really like to start on a GLP-1 weight loss injection. My BMI is currently 31. Can you please call in a prescription for the starter dose to my pharmacy so I can begin this week? Let me know if you need any info.",
    "timestamp": "Today, 5:40 PM",
    "relevant_history": "Obesity (BMI 31.2), Pre-diabetes",
    "active_medications": []
  },
  {
    "id": "msg_009",
    "patient_name": "Michael Chang",
    "patient_age": 59,
    "patient_gender": "M",
    "mrn": "MRN-78190",
    "subject": "Urgent: Routine lab shows high Potassium 5.7",
    "body": "Dr. Reynolds, my routine lab results just came in on MyChart: Serum Potassium is 5.7 mmol/L (flagged critical high) and Creatinine jumped to 1.8. I take Lisinopril 40mg and Spironolactone 25mg daily for my blood pressure and heart failure. Should I hold these medications tonight or go to the ER?",
    "timestamp": "Today, 5:15 PM",
    "relevant_history": "HFrEF (EF 35%), Stage 3a CKD, Hypertension",
    "active_medications": [
      "Lisinopril 40mg",
      "Spironolactone 25mg",
      "Carvedilol 25mg BID",
      "Furosemide 20mg"
    ]
  },
  {
    "id": "msg_010",
    "patient_name": "Patricia Gomez",
    "patient_age": 81,
    "patient_gender": "F",
    "mrn": "MRN-10294",
    "subject": "Handicap parking for my appointment on Thursday",
    "body": "Good afternoon, my daughter is driving me to my cardiology follow-up this Thursday at 10 AM. I use a walker and have difficulty walking long distances. Is there handicap parking directly adjacent to the main building entrance, or do we use the West Garage?",
    "timestamp": "Today, 4:45 PM",
    "relevant_history": "Severe Lumbar Spinal Stenosis, Osteoarthritis",
    "active_medications": [
      "Acetaminophen 650mg PRN"
    ]
  },
  {
    "id": "msg_011",
    "patient_name": "Brenda Foster",
    "patient_age": 44,
    "patient_gender": "F",
    "mrn": "MRN-39482",
    "subject": "Post-Op Day 4: Yellow oozing at incision and fever 101.3",
    "body": "Dr. Reynolds, I had laparoscopic cholecystectomy (gallbladder removal) 4 days ago. Today the umbilical incision site turned bright red, hot to the touch, and there is thick yellowish discharge seeping through the steristrips with an unpleasant odor. Took my temp and it's 101.3 F with chills. Pain is worsening.",
    "timestamp": "Today, 4:10 PM",
    "relevant_history": "s/p Lap Cholecystectomy (POD #4)",
    "active_medications": [
      "Oxycodone 5mg PRN",
      "Colace 100mg"
    ]
  },
  {
    "id": "msg_012",
    "patient_name": "Marcus Sterling",
    "patient_age": 26,
    "patient_gender": "M",
    "mrn": "MRN-60318",
    "subject": "Lingering dry cough for past 3 weeks",
    "body": "Hi, I had a standard head cold about 3 weeks ago that cleared up, but I've been left with this persistent dry, tickly cough that wakes me up at night. No fever, no shortness of breath, no phlegm. Over-the-counter Robitussin isn't helping much. Wondering if I need an inhaler or antibiotic?",
    "timestamp": "Today, 3:30 PM",
    "relevant_history": "Seasonal Allergies, Mild Childhood Asthma (no recent attacks)",
    "active_medications": [
      "Zyrtec 10mg"
    ]
  },
  {
    "id": "msg_013",
    "patient_name": "Harold Hughes",
    "patient_age": 76,
    "patient_gender": "M",
    "mrn": "MRN-22194",
    "subject": "Itemized Superbill for Supplemental Insurance",
    "body": "To the billing department: My Medicare supplemental insurance (Plan G) requires an itemized statement showing CPT procedure codes and diagnostic ICD-10 codes for my echocardiogram on Sept 8. Could you please email or mail this to my home address on file? Thank you, Harold.",
    "timestamp": "Today, 2:55 PM",
    "relevant_history": "Aortic Stenosis, Hypertension",
    "active_medications": [
      "Amlodipine 5mg"
    ]
  },
  {
    "id": "msg_014",
    "patient_name": "Lisa Morales",
    "patient_age": 35,
    "patient_gender": "F",
    "mrn": "MRN-88491",
    "subject": "Follow-up confirmed",
    "body": "Hi team, confirming that I received the reminder for my routine 6-month thyroid ultrasound next month on Oct 24th at 9:00 AM. See you all then, thank you for being so accommodating!",
    "timestamp": "Today, 2:10 PM",
    "relevant_history": "Benign Thyroid Nodule, Euthyroid",
    "active_medications": []
  },
  {
    "id": "msg_015",
    "patient_name": "Samuel Adams",
    "patient_age": 51,
    "patient_gender": "M",
    "mrn": "MRN-47209",
    "subject": "Weekly Home Blood Pressure Log Submission",
    "body": "Dr. Reynolds, here is my weekly blood pressure log as instructed at our last visit:\nMon: 134/84 (HR 72)\nTue: 130/82 (HR 68)\nWed: 138/86 (HR 74)\nThu: 132/80 (HR 70)\nFri: 136/84 (HR 71)\nFeeling good, taking the Lisinopril every morning without side effects. Please add to my chart for our next 6-month checkup.",
    "timestamp": "Today, 1:40 PM",
    "relevant_history": "Primary Hypertension (well-controlled)",
    "active_medications": [
      "Lisinopril 10mg daily"
    ]
  }
];

export const INITIAL_RESULTS: JevTriageResult[] = [
  {
    "message_id": "msg_001",
    "patient_name": "Robert Chen",
    "mrn": "MRN-84920",
    "subject": "Tight chest pressure and feeling dizzy",
    "snippet": "Dr. Reynolds, I was out mowing the lawn about 45 minutes ago and started getting this tight, heavy squeezing...",
    "lane": "01_EMERGENCY_DIVERT",
    "lane_title": "Emergency Red-Flag Divert",
    "lane_badge_color": "rose",
    "acuity_score": 10,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Emergency Red-Flag Divert.",
    "delegated_to": "Emergency Services (911 / Local ER)",
    "action_plan": "IMMEDIATE OVERRIDE: Advise patient not to drive; call 911 immediately.",
    "pre_drafted_action": "\ud83d\udea8 CRITICAL NOTICE: Your symptoms require emergency medical care. Please dial 911 immediately.",
    "latency_ms": 68.4,
    "token_cost_usd": 3e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 8:42 PM"
  },
  {
    "message_id": "msg_002",
    "patient_name": "Maria Rodriguez",
    "mrn": "MRN-72314",
    "subject": "Medication Refill: Atorvastatin 20mg",
    "snippet": "Hello, I am down to my last 3 tablets of Atorvastatin 20mg. Can you please authorize a 90-day refill to my...",
    "lane": "02_STAFF_DELEGATE",
    "lane_title": "Staff Delegation (MA / Desk)",
    "lane_badge_color": "sky",
    "acuity_score": 2,
    "requires_physician_license": false,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (98% confidence). Safe routing to Staff Delegation (MA / Desk).",
    "delegated_to": "Clinic Support Pool (MA / Desk)",
    "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
    "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
    "latency_ms": 64.2,
    "token_cost_usd": 2.8e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 8:15 PM"
  },
  {
    "message_id": "msg_003",
    "patient_name": "David Miller",
    "mrn": "MRN-65829",
    "subject": "Left knee is swollen and stiff after playing pickleball",
    "snippet": "Hi Doctor, 4 days ago I twisted my left knee during a pickleball match. It didn't pop, but by next morning it...",
    "lane": "03_CONVERT_TO_VISIT",
    "lane_title": "Convert to Billable Visit",
    "lane_badge_color": "amber",
    "acuity_score": 5,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (96% confidence). Safe routing to Convert to Billable Visit.",
    "delegated_to": "Patient Scheduling Coordinator",
    "action_plan": "Send 1-click billable appointment booking link to patient portal.",
    "pre_drafted_action": "\ud83d\udccb VISIT INVITE: 'Dr. Reynolds requests an in-person or video consultation to evaluate these new symptoms.'",
    "latency_ms": 66.8,
    "token_cost_usd": 2.9e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 7:50 PM"
  },
  {
    "message_id": "msg_004",
    "patient_name": "Elena Rostova",
    "mrn": "MRN-91204",
    "subject": "Biopsy Results in portal: High Grade Lesion (CIN-3)",
    "snippet": "Dr. Reynolds, I just received an alert that my cervical punch biopsy pathology report was uploaded to MyChart...",
    "lane": "04_PHYSICIAN_REVIEW",
    "lane_title": "Physician High-Acuity Review",
    "lane_badge_color": "emerald",
    "acuity_score": 8,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (99% confidence). Safe routing to Physician High-Acuity Review.",
    "delegated_to": "Attending Physician (Dr. Reynolds)",
    "action_plan": "Physician callback required for diagnostic disclosure or medication modification.",
    "pre_drafted_action": "\ud83d\udccb MD ACTION BRIEF: JEV routed encounter to physician queue for clinical order.",
    "latency_ms": 69.1,
    "token_cost_usd": 3.1e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 7:22 PM"
  },
  {
    "message_id": "msg_005",
    "patient_name": "James Wilson",
    "mrn": "MRN-33418",
    "subject": "Thank you!",
    "snippet": "Just wanted to send a quick note of thanks to Dr. Reynolds and Nurse Sarah. The antibiotic eye drops cleared...",
    "lane": "05_AUTO_RESOLVE",
    "lane_title": "Auto-Resolved / Archived",
    "lane_badge_color": "slate",
    "acuity_score": 1,
    "requires_physician_license": false,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Auto-Resolved / Archived.",
    "delegated_to": "Automated Medical Record Archive",
    "action_plan": "Silently log message to patient chart encounter history.",
    "pre_drafted_action": "Archived: Patient confirmation/gratitude logged to EHR history.",
    "latency_ms": 61.5,
    "token_cost_usd": 2.5e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 6:58 PM"
  },
  {
    "message_id": "msg_006",
    "patient_name": "Sarah Jenkins",
    "mrn": "MRN-44912",
    "subject": "Work Excuse Note for Monday & Tuesday",
    "snippet": "Hi clinic staff, I suffered a debilitating migraine attack on Monday that left me bedridden with light sensitivity...",
    "lane": "02_STAFF_DELEGATE",
    "lane_title": "Staff Delegation (MA / Desk)",
    "lane_badge_color": "sky",
    "acuity_score": 2,
    "requires_physician_license": false,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (97% confidence). Safe routing to Staff Delegation (MA / Desk).",
    "delegated_to": "Clinic Support Pool (MA / Desk)",
    "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
    "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
    "latency_ms": 65.0,
    "token_cost_usd": 2.8e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 6:30 PM"
  },
  {
    "message_id": "msg_007",
    "patient_name": "Arthur Pendelton",
    "mrn": "MRN-18239",
    "subject": "Right arm feels numb and slurred speech",
    "snippet": "Hello Dr. Reynolds, my husband Arthur asked me to write this because his right hand feels suddenly heavy and...",
    "lane": "01_EMERGENCY_DIVERT",
    "lane_title": "Emergency Red-Flag Divert",
    "lane_badge_color": "rose",
    "acuity_score": 10,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Emergency Red-Flag Divert.",
    "delegated_to": "Emergency Services (911 / Local ER)",
    "action_plan": "IMMEDIATE OVERRIDE: Advise patient not to drive; call 911 immediately.",
    "pre_drafted_action": "\ud83d\udea8 CRITICAL NOTICE: Your symptoms require emergency medical care. Please dial 911 immediately.",
    "latency_ms": 70.3,
    "token_cost_usd": 3.2e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 6:05 PM"
  },
  {
    "message_id": "msg_008",
    "patient_name": "Chloe Vance",
    "mrn": "MRN-55201",
    "subject": "Request for Wegovy / Zepbound Prescription",
    "snippet": "Hi Dr. Reynolds! A coworker of mine lost 35 pounds on Wegovy and I would really like to start on a GLP-1 weight...",
    "lane": "03_CONVERT_TO_VISIT",
    "lane_title": "Convert to Billable Visit",
    "lane_badge_color": "amber",
    "acuity_score": 4,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (95% confidence). Safe routing to Convert to Billable Visit.",
    "delegated_to": "Patient Scheduling Coordinator",
    "action_plan": "Send 1-click billable appointment booking link to patient portal.",
    "pre_drafted_action": "\ud83d\udccb VISIT INVITE: 'Dr. Reynolds requests an in-person or video consultation to evaluate these new symptoms.'",
    "latency_ms": 67.2,
    "token_cost_usd": 2.9e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 5:40 PM"
  },
  {
    "message_id": "msg_009",
    "patient_name": "Michael Chang",
    "mrn": "MRN-78190",
    "subject": "Urgent: Routine lab shows high Potassium 5.7",
    "snippet": "Dr. Reynolds, my routine lab results just came in on MyChart: Serum Potassium is 5.7 mmol/L (flagged critical...",
    "lane": "04_PHYSICIAN_REVIEW",
    "lane_title": "Physician High-Acuity Review",
    "lane_badge_color": "emerald",
    "acuity_score": 8,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (99% confidence). Safe routing to Physician High-Acuity Review.",
    "delegated_to": "Attending Physician (Dr. Reynolds)",
    "action_plan": "Physician callback required for diagnostic disclosure or medication modification.",
    "pre_drafted_action": "\ud83d\udccb MD ACTION BRIEF: JEV routed encounter to physician queue for clinical order.",
    "latency_ms": 69.5,
    "token_cost_usd": 3e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 5:15 PM"
  },
  {
    "message_id": "msg_010",
    "patient_name": "Patricia Gomez",
    "mrn": "MRN-10294",
    "subject": "Handicap parking for my appointment on Thursday",
    "snippet": "Good afternoon, my daughter is driving me to my cardiology follow-up this Thursday at 10 AM. I use a walker and...",
    "lane": "02_STAFF_DELEGATE",
    "lane_title": "Staff Delegation (MA / Desk)",
    "lane_badge_color": "sky",
    "acuity_score": 1,
    "requires_physician_license": false,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (98% confidence). Safe routing to Staff Delegation (MA / Desk).",
    "delegated_to": "Clinic Support Pool (MA / Desk)",
    "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
    "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
    "latency_ms": 63.8,
    "token_cost_usd": 2.7e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 4:45 PM"
  },
  {
    "message_id": "msg_011",
    "patient_name": "Brenda Foster",
    "mrn": "MRN-39482",
    "subject": "Post-Op Day 4: Yellow oozing at incision and fever 101.3",
    "snippet": "Dr. Reynolds, I had laparoscopic cholecystectomy (gallbladder removal) 4 days ago. Today the umbilical incision...",
    "lane": "04_PHYSICIAN_REVIEW",
    "lane_title": "Physician High-Acuity Review",
    "lane_badge_color": "emerald",
    "acuity_score": 8,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (99% confidence). Safe routing to Physician High-Acuity Review.",
    "delegated_to": "Attending Physician (Dr. Reynolds)",
    "action_plan": "Physician callback required for diagnostic disclosure or medication modification.",
    "pre_drafted_action": "\ud83d\udccb MD ACTION BRIEF: JEV routed encounter to physician queue for clinical order.",
    "latency_ms": 68.9,
    "token_cost_usd": 3e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 4:10 PM"
  },
  {
    "message_id": "msg_012",
    "patient_name": "Marcus Sterling",
    "mrn": "MRN-60318",
    "subject": "Lingering dry cough for past 3 weeks",
    "snippet": "Hi, I had a standard head cold about 3 weeks ago that cleared up, but I've been left with this persistent dry...",
    "lane": "03_CONVERT_TO_VISIT",
    "lane_title": "Convert to Billable Visit",
    "lane_badge_color": "amber",
    "acuity_score": 4,
    "requires_physician_license": true,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (96% confidence). Safe routing to Convert to Billable Visit.",
    "delegated_to": "Patient Scheduling Coordinator",
    "action_plan": "Send 1-click billable appointment booking link to patient portal.",
    "pre_drafted_action": "\ud83d\udccb VISIT INVITE: 'Dr. Reynolds requests an in-person or video consultation to evaluate these new symptoms.'",
    "latency_ms": 66.1,
    "token_cost_usd": 2.8e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 3:30 PM"
  },
  {
    "message_id": "msg_013",
    "patient_name": "Harold Hughes",
    "mrn": "MRN-22194",
    "subject": "Itemized Superbill for Supplemental Insurance",
    "snippet": "To the billing department: My Medicare supplemental insurance (Plan G) requires an itemized statement showing...",
    "lane": "02_STAFF_DELEGATE",
    "lane_title": "Staff Delegation (MA / Desk)",
    "lane_badge_color": "sky",
    "acuity_score": 1,
    "requires_physician_license": false,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (98% confidence). Safe routing to Staff Delegation (MA / Desk).",
    "delegated_to": "Clinic Support Pool (MA / Desk)",
    "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
    "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
    "latency_ms": 63.5,
    "token_cost_usd": 2.7e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 2:55 PM"
  },
  {
    "message_id": "msg_014",
    "patient_name": "Lisa Morales",
    "mrn": "MRN-88491",
    "subject": "Follow-up confirmed",
    "snippet": "Hi team, confirming that I received the reminder for my routine 6-month thyroid ultrasound next month on Oct 24th...",
    "lane": "05_AUTO_RESOLVE",
    "lane_title": "Auto-Resolved / Archived",
    "lane_badge_color": "slate",
    "acuity_score": 1,
    "requires_physician_license": false,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Auto-Resolved / Archived.",
    "delegated_to": "Automated Medical Record Archive",
    "action_plan": "Silently log message to patient chart encounter history.",
    "pre_drafted_action": "Archived: Patient confirmation/gratitude logged to EHR history.",
    "latency_ms": 61.2,
    "token_cost_usd": 2.5e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 2:10 PM"
  },
  {
    "message_id": "msg_015",
    "patient_name": "Samuel Adams",
    "mrn": "MRN-47209",
    "subject": "Weekly Home Blood Pressure Log Submission",
    "snippet": "Dr. Reynolds, here is my weekly blood pressure log as instructed at our last visit: Mon: 134/84 (HR 72) Tue: 130/82...",
    "lane": "02_STAFF_DELEGATE",
    "lane_title": "Staff Delegation (MA / Desk)",
    "lane_badge_color": "sky",
    "acuity_score": 2,
    "requires_physician_license": false,
    "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (97% confidence). Safe routing to Staff Delegation (MA / Desk).",
    "delegated_to": "Clinic Support Pool (MA / Desk)",
    "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
    "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
    "latency_ms": 64.9,
    "token_cost_usd": 2.8e-05,
    "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
    "timestamp": "Today, 1:40 PM"
  }
];

export const INITIAL_BATCH_METRICS: BatchResponse = {
  "results": [
    {
      "message_id": "msg_001",
      "patient_name": "Robert Chen",
      "mrn": "MRN-84920",
      "subject": "Tight chest pressure and feeling dizzy",
      "snippet": "Dr. Reynolds, I was out mowing the lawn about 45 minutes ago and started getting this tight, heavy squeezing...",
      "lane": "01_EMERGENCY_DIVERT",
      "lane_title": "Emergency Red-Flag Divert",
      "lane_badge_color": "rose",
      "acuity_score": 10,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Emergency Red-Flag Divert.",
      "delegated_to": "Emergency Services (911 / Local ER)",
      "action_plan": "IMMEDIATE OVERRIDE: Advise patient not to drive; call 911 immediately.",
      "pre_drafted_action": "\ud83d\udea8 CRITICAL NOTICE: Your symptoms require emergency medical care. Please dial 911 immediately.",
      "latency_ms": 68.4,
      "token_cost_usd": 3e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 8:42 PM"
    },
    {
      "message_id": "msg_002",
      "patient_name": "Maria Rodriguez",
      "mrn": "MRN-72314",
      "subject": "Medication Refill: Atorvastatin 20mg",
      "snippet": "Hello, I am down to my last 3 tablets of Atorvastatin 20mg. Can you please authorize a 90-day refill to my...",
      "lane": "02_STAFF_DELEGATE",
      "lane_title": "Staff Delegation (MA / Desk)",
      "lane_badge_color": "sky",
      "acuity_score": 2,
      "requires_physician_license": false,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (98% confidence). Safe routing to Staff Delegation (MA / Desk).",
      "delegated_to": "Clinic Support Pool (MA / Desk)",
      "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
      "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
      "latency_ms": 64.2,
      "token_cost_usd": 2.8e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 8:15 PM"
    },
    {
      "message_id": "msg_003",
      "patient_name": "David Miller",
      "mrn": "MRN-65829",
      "subject": "Left knee is swollen and stiff after playing pickleball",
      "snippet": "Hi Doctor, 4 days ago I twisted my left knee during a pickleball match. It didn't pop, but by next morning it...",
      "lane": "03_CONVERT_TO_VISIT",
      "lane_title": "Convert to Billable Visit",
      "lane_badge_color": "amber",
      "acuity_score": 5,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (96% confidence). Safe routing to Convert to Billable Visit.",
      "delegated_to": "Patient Scheduling Coordinator",
      "action_plan": "Send 1-click billable appointment booking link to patient portal.",
      "pre_drafted_action": "\ud83d\udccb VISIT INVITE: 'Dr. Reynolds requests an in-person or video consultation to evaluate these new symptoms.'",
      "latency_ms": 66.8,
      "token_cost_usd": 2.9e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 7:50 PM"
    },
    {
      "message_id": "msg_004",
      "patient_name": "Elena Rostova",
      "mrn": "MRN-91204",
      "subject": "Biopsy Results in portal: High Grade Lesion (CIN-3)",
      "snippet": "Dr. Reynolds, I just received an alert that my cervical punch biopsy pathology report was uploaded to MyChart...",
      "lane": "04_PHYSICIAN_REVIEW",
      "lane_title": "Physician High-Acuity Review",
      "lane_badge_color": "emerald",
      "acuity_score": 8,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (99% confidence). Safe routing to Physician High-Acuity Review.",
      "delegated_to": "Attending Physician (Dr. Reynolds)",
      "action_plan": "Physician callback required for diagnostic disclosure or medication modification.",
      "pre_drafted_action": "\ud83d\udccb MD ACTION BRIEF: JEV routed encounter to physician queue for clinical order.",
      "latency_ms": 69.1,
      "token_cost_usd": 3.1e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 7:22 PM"
    },
    {
      "message_id": "msg_005",
      "patient_name": "James Wilson",
      "mrn": "MRN-33418",
      "subject": "Thank you!",
      "snippet": "Just wanted to send a quick note of thanks to Dr. Reynolds and Nurse Sarah. The antibiotic eye drops cleared...",
      "lane": "05_AUTO_RESOLVE",
      "lane_title": "Auto-Resolved / Archived",
      "lane_badge_color": "slate",
      "acuity_score": 1,
      "requires_physician_license": false,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Auto-Resolved / Archived.",
      "delegated_to": "Automated Medical Record Archive",
      "action_plan": "Silently log message to patient chart encounter history.",
      "pre_drafted_action": "Archived: Patient confirmation/gratitude logged to EHR history.",
      "latency_ms": 61.5,
      "token_cost_usd": 2.5e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 6:58 PM"
    },
    {
      "message_id": "msg_006",
      "patient_name": "Sarah Jenkins",
      "mrn": "MRN-44912",
      "subject": "Work Excuse Note for Monday & Tuesday",
      "snippet": "Hi clinic staff, I suffered a debilitating migraine attack on Monday that left me bedridden with light sensitivity...",
      "lane": "02_STAFF_DELEGATE",
      "lane_title": "Staff Delegation (MA / Desk)",
      "lane_badge_color": "sky",
      "acuity_score": 2,
      "requires_physician_license": false,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (97% confidence). Safe routing to Staff Delegation (MA / Desk).",
      "delegated_to": "Clinic Support Pool (MA / Desk)",
      "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
      "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
      "latency_ms": 65.0,
      "token_cost_usd": 2.8e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 6:30 PM"
    },
    {
      "message_id": "msg_007",
      "patient_name": "Arthur Pendelton",
      "mrn": "MRN-18239",
      "subject": "Right arm feels numb and slurred speech",
      "snippet": "Hello Dr. Reynolds, my husband Arthur asked me to write this because his right hand feels suddenly heavy and...",
      "lane": "01_EMERGENCY_DIVERT",
      "lane_title": "Emergency Red-Flag Divert",
      "lane_badge_color": "rose",
      "acuity_score": 10,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Emergency Red-Flag Divert.",
      "delegated_to": "Emergency Services (911 / Local ER)",
      "action_plan": "IMMEDIATE OVERRIDE: Advise patient not to drive; call 911 immediately.",
      "pre_drafted_action": "\ud83d\udea8 CRITICAL NOTICE: Your symptoms require emergency medical care. Please dial 911 immediately.",
      "latency_ms": 70.3,
      "token_cost_usd": 3.2e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 6:05 PM"
    },
    {
      "message_id": "msg_008",
      "patient_name": "Chloe Vance",
      "mrn": "MRN-55201",
      "subject": "Request for Wegovy / Zepbound Prescription",
      "snippet": "Hi Dr. Reynolds! A coworker of mine lost 35 pounds on Wegovy and I would really like to start on a GLP-1 weight...",
      "lane": "03_CONVERT_TO_VISIT",
      "lane_title": "Convert to Billable Visit",
      "lane_badge_color": "amber",
      "acuity_score": 4,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (95% confidence). Safe routing to Convert to Billable Visit.",
      "delegated_to": "Patient Scheduling Coordinator",
      "action_plan": "Send 1-click billable appointment booking link to patient portal.",
      "pre_drafted_action": "\ud83d\udccb VISIT INVITE: 'Dr. Reynolds requests an in-person or video consultation to evaluate these new symptoms.'",
      "latency_ms": 67.2,
      "token_cost_usd": 2.9e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 5:40 PM"
    },
    {
      "message_id": "msg_009",
      "patient_name": "Michael Chang",
      "mrn": "MRN-78190",
      "subject": "Urgent: Routine lab shows high Potassium 5.7",
      "snippet": "Dr. Reynolds, my routine lab results just came in on MyChart: Serum Potassium is 5.7 mmol/L (flagged critical...",
      "lane": "04_PHYSICIAN_REVIEW",
      "lane_title": "Physician High-Acuity Review",
      "lane_badge_color": "emerald",
      "acuity_score": 8,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (99% confidence). Safe routing to Physician High-Acuity Review.",
      "delegated_to": "Attending Physician (Dr. Reynolds)",
      "action_plan": "Physician callback required for diagnostic disclosure or medication modification.",
      "pre_drafted_action": "\ud83d\udccb MD ACTION BRIEF: JEV routed encounter to physician queue for clinical order.",
      "latency_ms": 69.5,
      "token_cost_usd": 3e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 5:15 PM"
    },
    {
      "message_id": "msg_010",
      "patient_name": "Patricia Gomez",
      "mrn": "MRN-10294",
      "subject": "Handicap parking for my appointment on Thursday",
      "snippet": "Good afternoon, my daughter is driving me to my cardiology follow-up this Thursday at 10 AM. I use a walker and...",
      "lane": "02_STAFF_DELEGATE",
      "lane_title": "Staff Delegation (MA / Desk)",
      "lane_badge_color": "sky",
      "acuity_score": 1,
      "requires_physician_license": false,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (98% confidence). Safe routing to Staff Delegation (MA / Desk).",
      "delegated_to": "Clinic Support Pool (MA / Desk)",
      "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
      "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
      "latency_ms": 63.8,
      "token_cost_usd": 2.7e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 4:45 PM"
    },
    {
      "message_id": "msg_011",
      "patient_name": "Brenda Foster",
      "mrn": "MRN-39482",
      "subject": "Post-Op Day 4: Yellow oozing at incision and fever 101.3",
      "snippet": "Dr. Reynolds, I had laparoscopic cholecystectomy (gallbladder removal) 4 days ago. Today the umbilical incision...",
      "lane": "04_PHYSICIAN_REVIEW",
      "lane_title": "Physician High-Acuity Review",
      "lane_badge_color": "emerald",
      "acuity_score": 8,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (99% confidence). Safe routing to Physician High-Acuity Review.",
      "delegated_to": "Attending Physician (Dr. Reynolds)",
      "action_plan": "Physician callback required for diagnostic disclosure or medication modification.",
      "pre_drafted_action": "\ud83d\udccb MD ACTION BRIEF: JEV routed encounter to physician queue for clinical order.",
      "latency_ms": 68.9,
      "token_cost_usd": 3e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 4:10 PM"
    },
    {
      "message_id": "msg_012",
      "patient_name": "Marcus Sterling",
      "mrn": "MRN-60318",
      "subject": "Lingering dry cough for past 3 weeks",
      "snippet": "Hi, I had a standard head cold about 3 weeks ago that cleared up, but I've been left with this persistent dry...",
      "lane": "03_CONVERT_TO_VISIT",
      "lane_title": "Convert to Billable Visit",
      "lane_badge_color": "amber",
      "acuity_score": 4,
      "requires_physician_license": true,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (96% confidence). Safe routing to Convert to Billable Visit.",
      "delegated_to": "Patient Scheduling Coordinator",
      "action_plan": "Send 1-click billable appointment booking link to patient portal.",
      "pre_drafted_action": "\ud83d\udccb VISIT INVITE: 'Dr. Reynolds requests an in-person or video consultation to evaluate these new symptoms.'",
      "latency_ms": 66.1,
      "token_cost_usd": 2.8e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 3:30 PM"
    },
    {
      "message_id": "msg_013",
      "patient_name": "Harold Hughes",
      "mrn": "MRN-22194",
      "subject": "Itemized Superbill for Supplemental Insurance",
      "snippet": "To the billing department: My Medicare supplemental insurance (Plan G) requires an itemized statement showing...",
      "lane": "02_STAFF_DELEGATE",
      "lane_title": "Staff Delegation (MA / Desk)",
      "lane_badge_color": "sky",
      "acuity_score": 1,
      "requires_physician_license": false,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (98% confidence). Safe routing to Staff Delegation (MA / Desk).",
      "delegated_to": "Clinic Support Pool (MA / Desk)",
      "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
      "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
      "latency_ms": 63.5,
      "token_cost_usd": 2.7e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 2:55 PM"
    },
    {
      "message_id": "msg_014",
      "patient_name": "Lisa Morales",
      "mrn": "MRN-88491",
      "subject": "Follow-up confirmed",
      "snippet": "Hi team, confirming that I received the reminder for my routine 6-month thyroid ultrasound next month on Oct 24th...",
      "lane": "05_AUTO_RESOLVE",
      "lane_title": "Auto-Resolved / Archived",
      "lane_badge_color": "slate",
      "acuity_score": 1,
      "requires_physician_license": false,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (100% confidence). Safe routing to Auto-Resolved / Archived.",
      "delegated_to": "Automated Medical Record Archive",
      "action_plan": "Silently log message to patient chart encounter history.",
      "pre_drafted_action": "Archived: Patient confirmation/gratitude logged to EHR history.",
      "latency_ms": 61.2,
      "token_cost_usd": 2.5e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 2:10 PM"
    },
    {
      "message_id": "msg_015",
      "patient_name": "Samuel Adams",
      "mrn": "MRN-47209",
      "subject": "Weekly Home Blood Pressure Log Submission",
      "snippet": "Dr. Reynolds, here is my weekly blood pressure log as instructed at our last visit: Mon: 134/84 (HR 72) Tue: 130/82...",
      "lane": "02_STAFF_DELEGATE",
      "lane_title": "Staff Delegation (MA / Desk)",
      "lane_badge_color": "sky",
      "acuity_score": 2,
      "requires_physician_license": false,
      "clinical_rationale": "Evaluated by JEV System One (OpenRouter: typesafe/jev-1.13) (97% confidence). Safe routing to Staff Delegation (MA / Desk).",
      "delegated_to": "Clinic Support Pool (MA / Desk)",
      "action_plan": "Protocol delegation verified: Complete administrative task and notify patient.",
      "pre_drafted_action": "\ud83d\udccb STAFF ACTION: Handled under clinic standing protocol without physician interruption.",
      "latency_ms": 64.9,
      "token_cost_usd": 2.8e-05,
      "evaluated_by": "JEV System One (OpenRouter: typesafe/jev-1.13)",
      "timestamp": "Today, 1:40 PM"
    }
  ],
  "total_messages": 15,
  "physician_queue_count": 3,
  "deflected_count": 12,
  "physician_deflection_rate": 80.0,
  "total_latency_ms": 65.5,
  "average_latency_ms": 65.5,
  "total_cost_usd": 0.00012,
  "estimated_gpt4_cost_usd": 0.225,
  "pajama_time_saved_minutes": 30.0
};
