// src/pages/Medicare.jsx
import { useState, useMemo } from "react";

const DISEASE_DB = [
  {
    id: "heart", icon: "❤️", label: "Heart & Cardiovascular",
    color: "#f05a5a", bg: "rgba(240,90,90,0.12)", border: "rgba(240,90,90,0.25)", dot: "#f05a5a",
    diseases: [
      {
        id: "hypertension", name: "Hypertension (High Blood Pressure)",
        desc: "Silent killer — most common chronic disease in elderly worldwide",
        overview: "Hypertension means blood pressure consistently above 130/80 mmHg. It is the number one chronic disease in people over 60. It has no early symptoms but silently damages the heart, brain, kidneys, and blood vessels over years. Left untreated it leads to stroke, heart attack, and kidney failure.",
        symptoms: ["No symptoms in early stages — called the silent killer", "Headache and dizziness during very high BP", "Blurred vision or nosebleeds", "Chest tightness or shortness of breath", "Fatigue or confusion in severely elevated BP"],
        medicines: [
          { name: "Amlodipine", dose: "5–10 mg once daily", timing: "Morning", type: "Calcium channel blocker", use: "Relaxes and widens blood vessels, lowers BP", note: "Do not stop suddenly. May cause ankle swelling." },
          { name: "Losartan", dose: "25–100 mg once daily", timing: "Morning or evening", type: "ARB", use: "Blocks a hormone that tightens blood vessels", note: "Monitor potassium and kidney function regularly." },
          { name: "Atenolol", dose: "25–100 mg once daily", timing: "Morning", type: "Beta blocker", use: "Slows heart rate and reduces pumping force", note: "Never stop abruptly — taper slowly over 2 weeks." },
          { name: "Hydrochlorothiazide", dose: "12.5–25 mg once daily", timing: "Morning", type: "Thiazide diuretic", use: "Removes excess salt and fluid from body", note: "Monitor potassium. May increase urination. Stay hydrated." },
        ],
        diet: "Follow the DASH diet: reduce salt to under 2g/day. Eat plenty of fruits, vegetables, whole grains, and low-fat dairy. Avoid processed foods, alcohol, and smoking. Walk 30 minutes daily.",
        warning: "Start at lowest dose in elderly. Monitor BP at home daily. Never stop medication without doctor advice — BP rebounds dangerously.",
      },
      {
        id: "cad", name: "Coronary Artery Disease (CAD)",
        desc: "Plaque narrows heart arteries — leading cause of heart attacks",
        overview: "CAD is caused by cholesterol plaques building up inside the coronary arteries, narrowing them and reducing blood flow to the heart muscle. It is the single leading cause of heart attack and cardiac death in elderly people.",
        symptoms: ["Chest pain or pressure during activity (angina)", "Shortness of breath with exertion", "Fatigue and reduced exercise tolerance", "Pain radiating to left arm, jaw, shoulder, or back", "Sweating and nausea accompanying chest pain"],
        medicines: [
          { name: "Aspirin", dose: "75–100 mg once daily", timing: "After breakfast", type: "Antiplatelet", use: "Prevents blood clot formation inside narrowed arteries", note: "Take with food to protect stomach. Watch for bleeding." },
          { name: "Atorvastatin", dose: "10–80 mg once daily", timing: "Night", type: "Statin", use: "Lowers LDL cholesterol and stabilises artery plaques", note: "Monitor liver enzymes annually. Report any muscle pain." },
          { name: "Nitroglycerin", dose: "0.4 mg under tongue as needed", timing: "During chest pain only", type: "Nitrate (emergency)", use: "Rapidly widens arteries to relieve chest pain in 2–5 min", note: "Sit before use. Call emergency if 3 doses fail." },
          { name: "Bisoprolol", dose: "2.5–10 mg once daily", timing: "Morning", type: "Beta blocker", use: "Reduces heart oxygen demand", note: "Never stop abruptly. Avoid if severe asthma." },
        ],
        diet: "Mediterranean diet: fatty fish, olive oil, nuts, colourful vegetables, whole grains. Strictly limit saturated fat, red meat, fried food, and salt.",
        warning: "Seek emergency care for sudden severe chest pain. Call ambulance — do not drive yourself. Never stop heart medications without doctor advice.",
      },
      {
        id: "heart-failure", name: "Heart Failure",
        desc: "Heart cannot pump enough blood — breathlessness and leg swelling",
        overview: "Heart failure means the heart muscle is too weak to pump blood adequately. Fluid backs up into the lungs causing breathlessness and into the legs causing swelling. Very common in people over 65.",
        symptoms: ["Shortness of breath — worse lying flat", "Swollen ankles, legs, and feet", "Persistent fatigue even with simple tasks", "Rapid or irregular heartbeat", "Sudden weight gain from fluid", "Persistent cough from fluid in lungs"],
        medicines: [
          { name: "Furosemide", dose: "20–80 mg once or twice daily", timing: "Morning", type: "Loop diuretic", use: "Removes excess fluid from lungs and body", note: "Monitor potassium. May cause dizziness. Weigh daily." },
          { name: "Ramipril", dose: "2.5–10 mg once or twice daily", timing: "Morning", type: "ACE inhibitor", use: "Reduces workload on the heart", note: "May cause dry cough. Monitor kidney function." },
          { name: "Carvedilol", dose: "3.125–25 mg twice daily", timing: "With breakfast and dinner", type: "Beta blocker", use: "Improves heart function over time", note: "Start at 3.125 mg — increase slowly every 2 weeks." },
          { name: "Spironolactone", dose: "25–50 mg once daily", timing: "Morning", type: "Aldosterone antagonist", use: "Reduces fluid retention", note: "Monitor potassium closely — can be dangerous if high." },
        ],
        diet: "Limit fluid to 1.5–2 litres per day. Limit salt under 2g per day. Weigh every morning — alert doctor if weight rises more than 2kg in 2 days.",
        warning: "Sudden weight gain, increasing breathlessness, or worsening ankle swelling requires urgent care. Never stop medications suddenly.",
      },
      {
        id: "afib", name: "Atrial Fibrillation (AFib)",
        desc: "Irregular heartbeat that dramatically increases stroke risk",
        overview: "AFib is the most common serious heart rhythm disorder in elderly people. The upper chambers fire chaotically causing an irregular pulse. The main danger is blood clots forming that travel to the brain causing strokes — AFib increases stroke risk five-fold.",
        symptoms: ["Palpitations — heart racing, fluttering, or thumping", "Fatigue and reduced stamina", "Dizziness or lightheadedness", "Shortness of breath at rest or with mild activity", "Some patients feel nothing at all (asymptomatic)"],
        medicines: [
          { name: "Warfarin", dose: "Adjusted by INR blood test (target 2.0–3.0)", timing: "Same time every day", type: "Anticoagulant", use: "Prevents blood clots and stroke", note: "Requires INR monitoring every 4–8 weeks. Many food interactions." },
          { name: "Rivaroxaban", dose: "20 mg once daily", timing: "With evening meal", type: "NOAC", use: "Prevents stroke without regular blood monitoring", note: "Take with food. Never stop without doctor advice." },
          { name: "Digoxin", dose: "0.0625–0.125 mg once daily", timing: "Morning", type: "Cardiac glycoside", use: "Slows heart rate in AFib", note: "Very narrow safety window. Toxicity signs: nausea, yellow vision." },
          { name: "Bisoprolol", dose: "2.5–10 mg once daily", timing: "Morning with food", type: "Beta blocker", use: "Controls heart rate in AFib", note: "Do not stop abruptly. Monitor pulse and BP." },
        ],
        diet: "Strictly limit alcohol — even 1–2 drinks can trigger AFib. Reduce caffeine. If on Warfarin, keep vitamin K intake consistent.",
        warning: "Blood thinners increase bleeding risk. Emergency: sudden face drooping, arm weakness, speech difficulty — call ambulance immediately (stroke).",
      },
    ],
  },
  {
    id: "brain", icon: "🧠", label: "Brain & Neurological",
    color: "#9b87f5", bg: "rgba(155,135,245,0.12)", border: "rgba(155,135,245,0.25)", dot: "#7f77dd",
    diseases: [
      {
        id: "alzheimers", name: "Alzheimer's Disease & Dementia",
        desc: "Progressive memory loss — most common brain disease in elderly",
        overview: "Alzheimer's accounts for 60–80% of all dementia. It causes progressive destruction of brain cells starting with memory and gradually affecting all thinking, reasoning, and behaviour. Medicines can slow progression but cannot stop or reverse it.",
        symptoms: ["Forgetting recent events, names, and conversations", "Confusion about where they are or what day it is", "Difficulty with familiar tasks — cooking, using phone", "Mood changes — anxiety, suspicion, or depression", "Repeating the same questions multiple times", "Getting lost in familiar places"],
        medicines: [
          { name: "Donepezil", dose: "5–10 mg once daily", timing: "Bedtime", type: "Cholinesterase inhibitor", use: "Boosts acetylcholine — brain chemical needed for memory", note: "Start with 5mg for 4–6 weeks then increase. May cause nausea." },
          { name: "Memantine", dose: "5–20 mg once daily", timing: "Morning", type: "NMDA antagonist", use: "Protects brain cells from glutamate overstimulation", note: "Used in moderate to severe Alzheimer's. Well tolerated." },
          { name: "Rivastigmine", dose: "1.5–6 mg twice daily or patch", timing: "With meals or patch on back", type: "Cholinesterase inhibitor", use: "Prevents breakdown of acetylcholine in brain", note: "Patch form ideal for swallowing difficulty. Rotate site daily." },
        ],
        diet: "Mediterranean diet: olive oil, oily fish, nuts, berries, leafy greens, whole grains. Mental stimulation — puzzles, reading, music. Regular walking improves brain blood flow.",
        warning: "Medicines slow but cannot cure Alzheimer's. Begin legal planning (power of attorney) early. Caregiver support is essential.",
      },
      {
        id: "parkinsons", name: "Parkinson's Disease",
        desc: "Tremors, stiffness and slow movement from dopamine loss",
        overview: "Parkinson's occurs when dopamine-producing nerve cells gradually die. Dopamine is essential for smooth movement — its loss causes the characteristic tremors, stiffness, and slowness. Over time it also affects mood, sleep, cognition, and digestion.",
        symptoms: ["Resting tremor — rhythmic shaking at rest", "Rigidity — muscle stiffness making movements effortful", "Bradykinesia — slowed movement and shuffling steps", "Balance problems leading to falls", "Soft monotone voice and reduced facial expression", "Constipation, sleep problems, depression"],
        medicines: [
          { name: "Levodopa / Carbidopa", dose: "100/25 mg 3 times daily", timing: "30–60 min before meals on empty stomach", type: "Dopamine precursor — most effective", use: "Converts to dopamine in the brain", note: "Avoid high-protein meals close to dose. Wearing-off develops over years." },
          { name: "Pramipexole", dose: "0.125–1.5 mg 3 times daily", timing: "With meals", type: "Dopamine agonist", use: "Mimics dopamine action in brain", note: "May cause sudden sleep attacks. Monitor for compulsive behaviours." },
          { name: "Rasagiline", dose: "1 mg once daily", timing: "Morning", type: "MAO-B inhibitor", use: "Prevents dopamine breakdown in brain", note: "Avoid tyramine-rich foods (aged cheese, cured meats, red wine)." },
        ],
        diet: "High-fibre diet to prevent constipation. Adequate hydration. Time protein intake away from Levodopa doses. Small, frequent meals.",
        warning: "Falls are the biggest danger — install grab rails, remove loose rugs. Physiotherapy, occupational therapy, and speech therapy are as important as medication.",
      },
      {
        id: "depression", name: "Depression & Anxiety",
        desc: "Very common but underdiagnosed — worsens all physical conditions",
        overview: "Depression and anxiety affect 15–20% of people over 65 but are frequently dismissed as normal aging. They are serious medical conditions that reduce quality of life and worsen outcomes of all other diseases. They respond well to treatment.",
        symptoms: ["Persistent low mood most days for 2+ weeks", "Loss of interest in previously enjoyed activities", "Sleep disturbance — too little or too much", "Significant weight loss or poor appetite", "Fatigue and very low energy every day", "Excessive worry, restlessness, or fearfulness", "Withdrawal from family and social activities"],
        medicines: [
          { name: "Sertraline", dose: "25–100 mg once daily", timing: "Morning with breakfast", type: "SSRI antidepressant", use: "Increases serotonin — improves mood, sleep, and anxiety", note: "Start at 25mg in elderly. Full effect takes 4–6 weeks. Never stop abruptly." },
          { name: "Escitalopram", dose: "5–10 mg once daily (max 10mg over 65)", timing: "Morning or evening", type: "SSRI antidepressant", use: "Highly selective SSRI with fewer drug interactions", note: "Very well tolerated. Monitor sodium levels in those on diuretics." },
          { name: "Mirtazapine", dose: "7.5–30 mg once daily", timing: "Bedtime", type: "NaSSA antidepressant", use: "Improves mood and also helps sleep and poor appetite", note: "Helpful when insomnia and poor appetite are prominent. Weight gain possible." },
        ],
        diet: "Regular meal times, omega-3 rich foods (oily fish, walnuts). Social engagement, light exercise, sunlight exposure, and daily routines are powerful non-drug treatments.",
        warning: "Monitor for suicidal thoughts in the first 2 weeks of starting antidepressants. Therapy alongside medication is more effective than medication alone.",
      },
    ],
  },
  {
    id: "bones", icon: "🦴", label: "Bone & Joint Problems",
    color: "#f5a623", bg: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.25)", dot: "#ba7517",
    diseases: [
      {
        id: "arthritis", name: "Arthritis (Osteoarthritis)",
        desc: "Cartilage wears away causing joint pain and disability",
        overview: "Osteoarthritis is the most common joint disease, affecting over 30% of people aged 65+. Protective cartilage wears away causing bone-on-bone friction. Knees, hips, hands, and lower spine are most commonly affected.",
        symptoms: ["Deep aching joint pain worsening with activity", "Morning stiffness under 30 minutes", "Joint swelling, warmth, or tenderness", "Reduced range of movement", "Creaking or grinding sensation in joints", "Muscle weakness around the affected joint"],
        medicines: [
          { name: "Paracetamol", dose: "500–1000 mg up to 4 times daily", timing: "With or after food", type: "Analgesic", use: "First-line pain relief for mild to moderate joint pain", note: "Never exceed 4000mg (4g) per day. Safe long-term at correct dose." },
          { name: "Ibuprofen", dose: "200–400 mg up to 3 times daily", timing: "Strictly with food and water", type: "NSAID", use: "Reduces joint inflammation", note: "Avoid with stomach ulcers, kidney disease, or heart failure." },
          { name: "Diclofenac gel", dose: "Apply 2–4g to joint 3–4 times daily", timing: "Applied locally as needed", type: "Topical NSAID", use: "Local anti-inflammatory at joint with minimal side effects", note: "Wash hands after. Highly effective for knee and hand arthritis." },
          { name: "Duloxetine", dose: "30–60 mg once daily", timing: "Morning with food", type: "SNRI pain modulator", use: "Acts on brain pain processing for chronic joint pain", note: "Takes 2–4 weeks. May cause initial nausea." },
        ],
        diet: "Maintain healthy weight — every kg lost reduces knee force by 4kg. Anti-inflammatory foods: oily fish, turmeric, ginger, olive oil, leafy greens.",
        warning: "Avoid complete rest — it worsens muscle loss. Gentle daily exercise (swimming, cycling, walking) is the most effective long-term treatment.",
      },
      {
        id: "osteoporosis", name: "Osteoporosis",
        desc: "Silent bone loss causing fragile bones that fracture from minor falls",
        overview: "Osteoporosis is called the silent disease because bone density decreases with no symptoms until a fracture occurs. Post-menopausal women lose bone rapidly. Hip fractures from osteoporosis cause 20–30% mortality within one year.",
        symptoms: ["No symptoms until a fracture occurs — why screening is vital", "Severe back pain from a vertebral compression fracture", "Gradual loss of height over years", "Progressive stooped posture (Dowager's hump)", "Fractures from minor trauma — a sneeze, a cough, a small fall"],
        medicines: [
          { name: "Alendronate (Fosamax)", dose: "70 mg once weekly", timing: "First thing morning, empty stomach, nothing for 30–60 min after", type: "Bisphosphonate — first line", use: "Inhibits bone breakdown, increasing density over 2–3 years", note: "Take with full glass of water. Stay upright 30–60 min — lying down causes oesophageal damage." },
          { name: "Calcium + Vitamin D3", dose: "500–600 mg calcium twice daily + 800–1000 IU Vitamin D", timing: "Calcium with meals; Vitamin D any time", type: "Essential bone supplement", use: "Raw materials for bone building", note: "Split calcium into two doses. Never skip these supplements." },
          { name: "Raloxifene", dose: "60 mg once daily", timing: "Any time with or without food", type: "SERM", use: "Mimics oestrogen's protective effect on bone", note: "Post-menopausal women only. Avoid if blood clot history." },
          { name: "Denosumab injection", dose: "60 mg every 6 months", timing: "Given by healthcare provider", type: "RANK-L inhibitor", use: "Powerfully blocks bone breakdown", note: "CRITICAL: Do not stop without supervision — causes rebound bone loss and fractures." },
        ],
        diet: "Calcium daily: dairy, fortified plant milks, sardines with bones, leafy greens. Safe sun exposure 15 min daily for Vitamin D. Limit alcohol and caffeine.",
        warning: "Fall prevention is equally important as medication. Remove loose rugs, install grab rails, improve lighting. Tai Chi proven to reduce falls by 30%.",
      },
    ],
  },
  {
    id: "metabolic", icon: "🍬", label: "Metabolic Diseases",
    color: "#2ec4b6", bg: "rgba(46,196,182,0.12)", border: "rgba(46,196,182,0.25)", dot: "#1d9e75",
    diseases: [
      {
        id: "diabetes", name: "Type 2 Diabetes",
        desc: "High blood sugar silently damages nerves, kidneys, eyes, and heart",
        overview: "Type 2 diabetes affects 25–30% of people over 65. The body becomes resistant to insulin and cannot keep blood sugar safe. Chronically high blood sugar damages blood vessels and nerves — causing heart disease, kidney failure, blindness, nerve damage, and foot amputations if poorly controlled.",
        symptoms: ["Increased thirst and frequent urination at night", "Persistent fatigue that rest does not improve", "Blurred vision that fluctuates", "Slow-healing wounds, cuts, and bruises", "Numbness or tingling in feet and hands", "Frequent skin, urinary tract, or gum infections"],
        medicines: [
          { name: "Metformin", dose: "500–2000 mg daily in divided doses", timing: "With breakfast and dinner", type: "Biguanide — first-line", use: "Reduces liver glucose production, improves insulin sensitivity", note: "Start at 500mg — increase slowly. Stop before contrast dye procedures." },
          { name: "Gliclazide", dose: "40–320 mg daily", timing: "30 minutes before main meal", type: "Sulfonylurea", use: "Stimulates pancreas to produce more insulin after meals", note: "Can cause hypoglycaemia — keep glucose tablets available." },
          { name: "Sitagliptin", dose: "100 mg once daily; 50 mg if kidney disease", timing: "Any time with or without food", type: "DPP-4 inhibitor", use: "Enhances natural insulin release — very low hypoglycaemia risk", note: "Very well tolerated in elderly. Reduce dose if kidneys weak." },
          { name: "Insulin", dose: "Individually prescribed", timing: "Basal at night or bolus with meals", type: "Insulin therapy", use: "Directly lowers blood sugar when oral medicines insufficient", note: "Requires injection training. Always carry fast-acting glucose." },
        ],
        diet: "Low glycaemic foods: lentils, chickpeas, vegetables, nuts. Avoid white rice, white bread, sugary drinks. A 15-minute walk after meals significantly lowers blood sugar.",
        warning: "Check BOTH feet every day for cuts or blisters — diabetic neuropathy removes pain sensation. Annual eye exam. Kidney function test every 6 months.",
      },
    ],
  },
  {
    id: "lungs", icon: "🫁", label: "Lung Diseases",
    color: "#7ac142", bg: "rgba(120,193,64,0.12)", border: "rgba(120,193,64,0.25)", dot: "#639922",
    diseases: [
      {
        id: "copd", name: "COPD (Chronic Obstructive Pulmonary Disease)",
        desc: "Permanent lung damage causing progressive breathing difficulty",
        overview: "COPD is primarily chronic bronchitis and emphysema causing airflow obstruction and increasingly difficult breathing. It is the third leading cause of death worldwide. Long-term smoking causes over 90% of cases. The damage is permanent but progression slows with treatment.",
        symptoms: ["Chronic productive cough with mucus, worst in mornings", "Progressively worsening shortness of breath with activities", "Wheezing — high-pitched whistling when breathing", "Chest tightness and heaviness", "Frequent and prolonged chest infections", "Progressive reduction in exercise tolerance over years"],
        medicines: [
          { name: "Salbutamol inhaler", dose: "1–2 puffs (100 mcg each) as needed", timing: "When breathless — rescue inhaler only", type: "SABA — rescue inhaler", use: "Rapidly opens airways during breathlessness", note: "Correct technique critical. Rinse mouth after use." },
          { name: "Tiotropium inhaler", dose: "18 mcg (1 capsule) once daily", timing: "Every morning — maintenance inhaler", type: "LAMA — maintenance", use: "Keeps airways open for 24 hours, reduces flare-ups", note: "Do NOT use for sudden breathlessness. Use HandiHaler device." },
          { name: "Fluticasone/Salmeterol inhaler", dose: "1 puff twice daily", timing: "Morning and evening", type: "ICS/LABA combination", use: "Reduces inflammation and keeps airways open for 12 hours", note: "ALWAYS rinse mouth after use — prevents oral thrush." },
        ],
        diet: "High-protein diet for respiratory muscle strength. Small frequent meals — large meals worsen breathlessness. Stay hydrated to keep mucus thin.",
        warning: "STOPPING SMOKING is the single most effective treatment. Annual flu vaccine and pneumococcal vaccine. Avoid indoor air pollution.",
      },
    ],
  },
  {
    id: "cancer", icon: "🧬", label: "Cancer (Risk Rises with Age)",
    color: "#e85c8a", bg: "rgba(232,92,138,0.12)", border: "rgba(232,92,138,0.25)", dot: "#d4537e",
    diseases: [
      {
        id: "lung-cancer", name: "Lung Cancer",
        desc: "Leading cause of cancer death — mainly from smoking in elderly",
        overview: "Lung cancer is responsible for more cancer deaths than any other cancer. Risk increases steeply with age — majority diagnosed after 65. Smoking causes 85% of cases. Most are diagnosed at advanced stage because early disease has no symptoms.",
        symptoms: ["Persistent new cough that does not go away or worsens", "Coughing up blood or rust-coloured phlegm", "Chest, shoulder, or back pain", "Hoarseness or change in voice quality", "Unexplained weight loss and appetite loss", "Repeated pneumonia in the same lung area"],
        medicines: [
          { name: "Carboplatin + Paclitaxel", dose: "Calculated individually every 3 weeks IV", timing: "Hospital IV infusion — 4–6 cycles", type: "Platinum chemotherapy", use: "Kills rapidly dividing cancer cells throughout body", note: "Causes nausea, fatigue, hair loss, low immunity. Anti-nausea medicines given alongside." },
          { name: "Erlotinib / Gefitinib", dose: "100–250 mg daily", timing: "As prescribed", type: "EGFR targeted therapy", use: "Blocks protein driving cancer cell growth", note: "Only works in tumours with EGFR mutation (15% of cases)." },
          { name: "Pembrolizumab", dose: "200 mg every 3 weeks IV", timing: "Hospital IV every 3 weeks", type: "PD-1 immunotherapy", use: "Allows immune system to attack lung cancer cells", note: "Can cause immune reactions in any organ. Report any new symptoms immediately." },
        ],
        diet: "Maintain adequate nutrition during treatment. Protein-rich foods prevent weight loss. Ginger for nausea. Small frequent meals better than large ones.",
        warning: "Stop smoking immediately — even after diagnosis it improves outcomes. All treatment by specialist multidisciplinary team. CT screening for heavy smokers aged 50–80.",
      },
      {
        id: "breast-cancer", name: "Breast Cancer",
        desc: "Most common cancer in women — early detection is life-saving",
        overview: "Breast cancer is the most common cancer in women. Risk increases significantly with age — 80% of cases in women over 50. Most are oestrogen receptor-positive (ER+). Early-stage breast cancer has a 5-year survival rate exceeding 90%.",
        symptoms: ["New painless lump in breast or underarm", "Change in breast size or shape", "Skin dimpling, redness, or puckering", "Nipple inversion, discharge, or crusting", "Enlarged lymph node in armpit", "Early breast cancer usually causes NO pain"],
        medicines: [
          { name: "Tamoxifen", dose: "20 mg once daily for 5–10 years", timing: "Same time daily", type: "SERM", use: "Blocks oestrogen receptors preventing cancer growth", note: "Hot flushes and joint aches common. Small increased blood clot risk." },
          { name: "Letrozole / Anastrozole", dose: "2.5 mg or 1 mg once daily", timing: "Same time daily", type: "Aromatase inhibitor", use: "Blocks oestrogen production in post-menopausal women", note: "Post-menopausal women only. Take with calcium and Vitamin D." },
          { name: "Trastuzumab (Herceptin)", dose: "Loading 8 mg/kg then 6 mg/kg every 3 weeks IV", timing: "Hospital IV every 3 weeks for 1 year", type: "HER2-targeted antibody", use: "Blocks HER2 protein in HER2-positive breast cancer", note: "Only for HER2-positive breast cancer (20% of cases). Regular heart scans needed." },
        ],
        diet: "Mediterranean diet reduces recurrence risk. Maintain healthy weight. Limit alcohol strictly. Regular exercise improves survival.",
        warning: "Monthly breast self-examination and annual mammography from age 40–50. Early-stage breast cancer is highly curable. See doctor within days for any breast change.",
      },
      {
        id: "prostate-cancer", name: "Prostate Cancer",
        desc: "Most common cancer in elderly men — often slow-growing",
        overview: "Prostate cancer is the most frequently diagnosed cancer in men, majority in men over 65. Most are slow-growing and may never cause serious harm. Aggressive forms need prompt treatment. PSA blood testing allows detection when most curable.",
        symptoms: ["Weak or slow urine stream", "Frequent urination especially at night", "Feeling bladder not fully emptied", "Blood in urine or semen", "Bone pain in back or hips if spread", "Early prostate cancer causes NO symptoms"],
        medicines: [
          { name: "Enzalutamide", dose: "160 mg once daily (four 40 mg capsules)", timing: "Same time daily", type: "Androgen receptor inhibitor", use: "Blocks testosterone reaching cancer cells", note: "Fatigue and hot flushes common. Take all four capsules together." },
          { name: "Bicalutamide", dose: "50–150 mg once daily", timing: "Same time daily", type: "Antiandrogen", use: "Blocks testosterone receptors preventing cancer growth", note: "May cause breast tenderness. Monitor liver function at 3 months." },
          { name: "Leuprorelin injection", dose: "3.75 mg monthly or 11.25 mg every 3 months", timing: "Administered by nurse or doctor", type: "LHRH agonist", use: "Suppresses testosterone production to undetectable levels", note: "Long-term use causes bone loss — calcium and Vitamin D essential." },
        ],
        diet: "Tomatoes (lycopene), cruciferous vegetables (broccoli, cauliflower), pomegranate juice, and green tea have cancer-preventive properties. Reduce red and processed meat.",
        warning: "PSA screening from age 50 (age 40 with family history). Many men managed with active surveillance. Hormone therapy causes bone thinning — exercise and supplements essential.",
      },
    ],
  },
];

const S = {
  page: { padding: "22px 24px", maxWidth: "960px", margin: "0 auto", fontFamily: "'Nunito', 'Segoe UI', sans-serif" },
  title: { fontSize: "20px", fontWeight: 900, color: "#eef0f8", marginBottom: "4px" },
  sub: { fontSize: "12px", color: "#8491b0", marginBottom: "18px" },
  searchWrap: { position: "relative", marginBottom: "18px" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none" },
  searchInput: { width: "100%", padding: "9px 14px 9px 36px", fontSize: "13px", background: "#1a2235", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50px", color: "#eef0f8", outline: "none", fontFamily: "inherit" },
  catCard: { background: "#1a2235", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "12px", overflow: "hidden" },
  catHdr: { padding: "13px 16px", display: "flex", alignItems: "center", gap: "11px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  catIco: { width: "38px", height: "38px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px", flexShrink: 0 },
  catTitle: { fontSize: "13px", fontWeight: 800, color: "#eef0f8" },
  catSub: { fontSize: "10.5px", color: "#8491b0", marginTop: "1px" },
  catChev: { marginLeft: "auto", color: "#505d7a", fontSize: "11px", transition: "transform 0.18s", flexShrink: 0 },
  catBody: { padding: "12px 16px" },
  disRow: { background: "#202840", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "11px 13px", marginBottom: "8px", cursor: "pointer" },
  disName: { fontSize: "12.5px", fontWeight: 800, color: "#eef0f8" },
  disDesc: { fontSize: "11px", color: "#8491b0", marginTop: "2px" },
  disCta: { fontSize: "10.5px", fontWeight: 700, marginTop: "5px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", justifyContent: "flex-end" },
  panel: { width: "min(500px, 100vw)", height: "100vh", background: "#13192a", overflowY: "auto", animation: "slideIn 0.2s ease" },
  panelHdr: { position: "sticky", top: 0, background: "#13192a", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px", display: "flex", alignItems: "center", gap: "11px", zIndex: 10 },
  closeBtn: { width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "none", color: "#8491b0", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" },
  panelTitle: { fontSize: "15px", fontWeight: 900, color: "#eef0f8" },
  panelCat: { fontSize: "11px", color: "#8491b0", marginTop: "1px" },
  panelBody: { padding: "18px" },
  secLbl: { fontSize: "9px", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "#505d7a", margin: "14px 0 7px" },
  ovBox: { background: "#202840", borderRadius: "8px", padding: "11px 13px", fontSize: "12.5px", color: "#8491b0", lineHeight: 1.7 },
  symBox: { background: "#202840", borderRadius: "8px", padding: "11px 13px" },
  symRow: { display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "5px", fontSize: "12.5px", color: "#eef0f8" },
  symDot: { width: "6px", height: "6px", borderRadius: "50%", marginTop: "5px", flexShrink: 0 },
  medCard: { background: "#202840", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "11px 13px", marginBottom: "7px" },
  medName: { fontSize: "12.5px", fontWeight: 800, color: "#eef0f8", marginBottom: "5px" },
  pillsRow: { display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" },
  pill: (color, bg) => ({ background: bg, color, fontSize: "10.5px", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }),
  medNote: { fontSize: "11px", color: "#8491b0", borderLeft: "2px solid rgba(255,255,255,0.12)", paddingLeft: "9px", lineHeight: 1.5 },
  dietBox: { background: "rgba(46,196,182,0.07)", border: "1px solid rgba(46,196,182,0.18)", borderRadius: "8px", padding: "11px 13px", fontSize: "12.5px", color: "#8491b0", lineHeight: 1.7 },
  warnBox: { background: "rgba(245,166,35,0.09)", border: "1px solid rgba(245,166,35,0.22)", borderRadius: "8px", padding: "11px 13px", fontSize: "11.5px", color: "#f5c96a", lineHeight: 1.55, display: "flex", gap: "7px", marginTop: "4px" },
  discBox: { background: "rgba(240,90,90,0.08)", border: "1px solid rgba(240,90,90,0.2)", borderRadius: "8px", padding: "11px 13px", fontSize: "11.5px", color: "#f08080", lineHeight: 1.65, marginTop: "11px" },
  
};

function DetailPanel({ disease, category, onClose, onAdd }) {
  return (
    <>
      <style>{`@keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}.dp-sc::-webkit-scrollbar{width:5px}.dp-sc::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}`}</style>
      <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={S.panel} className="dp-sc">
          <div style={S.panelHdr}>
            <button style={S.closeBtn} onClick={onClose}>✕</button>
            <div>
              <div style={S.panelTitle}>{disease.name}</div>
              <div style={S.panelCat}><span style={{ color: category.color }}>{category.icon} {category.label}</span></div>
            </div>
          </div>
          <div style={S.panelBody}>
            <div style={S.secLbl}>Overview</div>
            <div style={S.ovBox}>{disease.overview}</div>

            <div style={S.secLbl}>Common Symptoms</div>
            <div style={S.symBox}>
              {disease.symptoms.map((s, i) => (
                <div key={i} style={S.symRow}>
                  <span style={{ ...S.symDot, background: category.dot }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <div style={S.secLbl}>Medicines Commonly Prescribed</div>
            {disease.medicines.map((m, i) => (
              <div key={i} style={S.medCard}>
                <div style={S.medName}>💊 {m.name}</div>
                <div style={S.pillsRow}>
                  <span style={S.pill("#7fb3ff", "rgba(79,142,247,0.15)")}>📏 {m.dose}</span>
                  <span style={S.pill("#f5c96a", "rgba(245,166,35,0.15)")}>⏰ {m.timing}</span>
                  <span style={S.pill("#5cddd4", "rgba(46,196,182,0.15)")}>🏷 {m.type}</span>
                  <span style={S.pill("#5ddea0", "rgba(34,200,122,0.15)")}>✅ {m.use}</span>
                </div>
                <div style={S.medNote}>⚠️ {m.note}</div>
              </div>
            ))}

            <div style={S.secLbl}>Diet &amp; Lifestyle</div>
            <div style={S.dietBox}>🥗 {disease.diet}</div>

            <div style={S.secLbl}>Important Warning</div>
            <div style={S.warnBox}>
              <span style={{ fontSize: "15px", flexShrink: 0 }}>⚠️</span>
              <span>{disease.warning}</span>
            </div>

            <div style={S.discBox}>
              <strong>⚕️ Medical Disclaimer — </strong>
              The medicines listed here are for <strong>educational reference only</strong>.{" "}
              <strong>Always consult your doctor or pharmacist before starting, stopping, or changing any medicine.</strong>{" "}
              Elderly patients often need lower doses. Many medicines interact with each other.{" "}
              <strong>Self-medicating without medical supervision can be dangerous.</strong>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
}

export default function Medicare({ onAddToReminder }) {
  const [query, setQuery] = useState("");
  const [openCats, setOpenCats] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const q = query.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!q) return DISEASE_DB;
    return DISEASE_DB.map((cat) => ({
      ...cat,
      diseases: cat.diseases.filter(
        (d) => d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.diseases.length > 0);
  }, [q]);

  function toggleCat(id) {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const isOpen = (id) => openCats.has(id) || !!q;

  return (
    <div style={S.page}>
      <div style={S.title}>Medicare 🏥</div>
      <div style={S.sub}>Common diseases in elderly — tap a disease to see full details, medicines, symptoms and diet advice.</div>

      <div style={S.searchWrap}>
        <svg style={S.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          style={S.searchInput}
          type="text"
          placeholder="Search diseases, symptoms, medicines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#505d7a", fontSize: "13px" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
          No diseases found for &ldquo;{query}&rdquo;
        </div>
      ) : (
        filtered.map((cat) => (
          <div key={cat.id} style={S.catCard}>
            <div style={S.catHdr} onClick={() => toggleCat(cat.id)}>
              <div style={{ ...S.catIco, background: cat.bg, border: `1px solid ${cat.border}` }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={S.catTitle}>{cat.label}</div>
                <div style={S.catSub}>{cat.diseases.length} condition{cat.diseases.length !== 1 ? "s" : ""}</div>
              </div>
              <span style={{ ...S.catChev, transform: isOpen(cat.id) ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </div>
            {isOpen(cat.id) && (
              <div style={S.catBody}>
                {cat.diseases.map((disease) => (
                  <div
                    key={disease.id}
                    style={S.disRow}
                    onClick={() => setSelected({ disease, category: cat })}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = cat.border; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#202840"; }}
                  >
                    <div style={S.disName}>{disease.name}</div>
                    <div style={S.disDesc}>{disease.desc}</div>
                    <div style={{ ...S.disCta, color: cat.color }}>Tap for symptoms, medicines &amp; diet →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <div style={{ marginTop: "8px", padding: "10px 14px", background: "#1a2235", borderRadius: "8px", fontSize: "11.5px", color: "#505d7a", display: "flex", gap: "14px", flexWrap: "wrap" }}>
        <span>📊 <strong style={{ color: "#8491b0" }}>{DISEASE_DB.reduce((a, c) => a + c.diseases.length, 0)}</strong> diseases</span>
        <span>💊 <strong style={{ color: "#8491b0" }}>{DISEASE_DB.reduce((a, c) => a + c.diseases.reduce((b, d) => b + d.medicines.length, 0), 0)}</strong> medicines</span>
        <span>🏷 <strong style={{ color: "#8491b0" }}>{DISEASE_DB.length}</strong> categories</span>
      </div>

      {selected && (
        <DetailPanel
          disease={selected.disease}
          category={selected.category}
          onClose={() => setSelected(null)}
          onAdd={(name) => { setSelected(null); onAddToReminder && onAddToReminder(name); }}
        />
      )}
    </div>
  );
}