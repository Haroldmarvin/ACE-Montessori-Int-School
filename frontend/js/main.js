/**
 * ACE Montessori - Public Admission Submission Logic
 * Linked to Backend Port 8080
 */

const API_ADMISSION_URL = 'http://localhost:8080/api/admissions/apply';

document.addEventListener('DOMContentLoaded', () => {
    const admissionForm = document.getElementById('admissionForm');

    if (admissionForm) {
        admissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. UI Feedback: Disable button to prevent double-clicks
            const submitBtn = admissionForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Sending Application...
            `;

            // 2. Data Aggregation
            const formData = {
                studentName: document.getElementById('studentName').value.trim(),
                gradeApplyingFor: document.getElementById('gradeApplyingFor').value,
                parentName: document.getElementById('parentName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Log for local development tracking
            console.log("🚀 Submitting to ACE Systems:", formData);

            try {
                // 3. API Call
                const response = await fetch(API_ADMISSION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // 4. Success Case
                    alert("🎉 Success! Your application has been received. Our admissions team will contact you shortly.");
                    admissionForm.reset();
                    
                    // Optional: Redirect to a "Thank You" page
                    // window.location.href = "thank-you.html";
                    
                } else {
                    // 5. Server-side Error (Validation)
                    throw new Error(result.message || "The server rejected the application. Please check your details.");
                }

            } catch (error) {
                // 6. Network/Connection Error
                console.error("❌ Submission Failed:", error);
                alert(`Submission Error: ${error.message}\n\nPlease check your internet connection or try again later.`);
                
            } finally {
                // 7. Restore Button State
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        });
    }
});