# Test Case Scenarios for Pregnancy Health Assessment

These realistic test scenarios will help verify both the assessment form and chat functionality work correctly across all risk levels.

## High Risk Scenarios

### Test Case 1: Emergency Bleeding
**Profile:** 28 weeks pregnant, first pregnancy
**Symptoms to Select:**
- Severe Bleeding
- Severe Cramping
- Dizziness
- Back Pain

**Additional Information:**
- Gestational Week: 28
- Previous Complications: No
- Additional Symptoms: "Heavy bleeding that soaked through a pad in 30 minutes, sharp cramping pain"

**Expected Result:**
- Risk Level: HIGH
- Urgency: IMMEDIATE
- Recommendations: Seek immediate medical attention, call emergency services

**Chat Test:** "I'm 28 weeks pregnant and having heavy bleeding with severe cramping. The bleeding soaked through a pad in 30 minutes and I feel dizzy."

---

### Test Case 2: Severe Headache with Vision Changes
**Profile:** 34 weeks pregnant, history of complications
**Symptoms to Select:**
- Severe Headache
- Vision Changes
- Swelling
- Fever

**Additional Information:**
- Gestational Week: 34
- Previous Complications: Yes
- Additional Symptoms: "Severe headache for 2 hours, seeing spots, swollen hands and face"

**Expected Result:**
- Risk Level: HIGH
- Urgency: IMMEDIATE
- Recommendations: Immediate medical attention, possible preeclampsia signs

**Chat Test:** "I'm 34 weeks pregnant with a severe headache for 2 hours, seeing spots in my vision, and my hands and face are very swollen. I had complications in my last pregnancy."

---

## Moderate Risk Scenarios

### Test Case 3: Regular Contractions
**Profile:** 36 weeks pregnant, experienced mother
**Symptoms to Select:**
- Contractions
- Back Pain
- Pelvic Pressure
- Frequent Urination

**Additional Information:**
- Gestational Week: 36
- Previous Complications: No
- Additional Symptoms: "Contractions every 10 minutes for the past hour, lower back pain"

**Expected Result:**
- Risk Level: MODERATE to HIGH
- Urgency: WITHIN_24_HOURS
- Recommendations: Contact healthcare provider, monitor contraction timing

**Chat Test:** "I'm 36 weeks pregnant and having contractions every 10 minutes for the past hour with lower back pain and pressure. This is my second baby."

---

### Test Case 4: Persistent Fever
**Profile:** 22 weeks pregnant, first pregnancy
**Symptoms to Select:**
- Fever
- Chills
- Headache
- Fatigue

**Additional Information:**
- Gestational Week: 22
- Previous Complications: No
- Additional Symptoms: "Fever of 100.8°F for 2 days, chills, feeling very tired"

**Expected Result:**
- Risk Level: MODERATE to HIGH
- Urgency: WITHIN_24_HOURS
- Recommendations: Contact healthcare provider, monitor temperature

**Chat Test:** "I'm 22 weeks pregnant with my first baby. I've had a fever of 100.8°F for 2 days with chills and I'm extremely tired."

---

## Low Risk Scenarios

### Test Case 5: Early Pregnancy Symptoms
**Profile:** 8 weeks pregnant, first pregnancy
**Symptoms to Select:**
- Morning Sickness
- Fatigue
- Breast Tenderness
- Frequent Urination

**Additional Information:**
- Gestational Week: 8
- Previous Complications: No
- Additional Symptoms: "Nausea mainly in the morning, very tired, breasts are sore"

**Expected Result:**
- Risk Level: LOW
- Urgency: ROUTINE
- Recommendations: Continue regular prenatal care, maintain healthy lifestyle

**Chat Test:** "I'm 8 weeks pregnant with my first baby. I have morning sickness, I'm very tired, and my breasts are sore. Is this normal?"

---

### Test Case 6: Third Trimester Discomfort
**Profile:** 32 weeks pregnant, second pregnancy
**Symptoms to Select:**
- Heartburn
- Leg Cramps
- Constipation
- Back Pain (mild)

**Additional Information:**
- Gestational Week: 32
- Previous Complications: No
- Additional Symptoms: "Heartburn after meals, leg cramps at night, some lower back discomfort"

**Expected Result:**
- Risk Level: LOW
- Urgency: ROUTINE
- Recommendations: Normal pregnancy symptoms, lifestyle modifications

**Chat Test:** "I'm 32 weeks pregnant with my second child. I have heartburn after eating, leg cramps at night, and some lower back discomfort. My first pregnancy was normal."

---

## How to Test

### Assessment Form Testing:
1. Go to "Start Assessment" page
2. Follow the 3-step process
3. Select symptoms from the provided list
4. Fill in gestational week and complications
5. Add additional symptoms in text area
6. Submit and verify results match expected outcome

### Chat Testing:
1. Click "Chat with AI" button
2. Type the chat test message
3. Verify the AI provides appropriate risk assessment
4. Check that recommendations match expected urgency level

### Verification Points:
- Risk level displays correctly (color-coded)
- Urgency level shows appropriate timeframe
- Recommendations are medically appropriate
- Confidence score is reasonable (70-95%)
- Emergency contacts appear for high-risk cases

### Cross-Platform Testing:
- Test both features on desktop and mobile
- Verify responsive design works
- Check that results are consistent between chat and form
- Ensure medical disclaimers are visible

These scenarios cover the full spectrum of pregnancy symptoms from normal early pregnancy signs to serious emergency conditions, ensuring your assessment system works accurately across all risk levels.