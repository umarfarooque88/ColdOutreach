// firestore-outreach.js

// Ensure db is available
const db = firebase.firestore();

if (!window.db) {
    console.error("Firestore database instance not found!");
}

// Function to save outreach to Firestore
async function saveOutreachToFirestore(outreachData) {
    try {
        // Input validation
        if (!outreachData || !outreachData.businessType || !outreachData.service) {
            throw new Error("Required outreach data missing");
        }

        // Create the outreach document
        const outreachDoc = await db.collection('outreaches').add({
            businessType: outreachData.businessType,
            service: outreachData.service,
            recipientInfo: {
                name: outreachData.recipientName || 'Unknown',
                location: outreachData.recipientLocation || 'Unknown'
            },
            generatedContent: {
                subjectLine: outreachData.subjectLine || '',
                emailContent: outreachData.emailContent || '',
                tone: outreachData.tone || 'professional'
            },
            metadata: {
                generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: "completed"
            }
        });

        console.log("New outreach created with ID: ", outreachDoc.id);

        // Update metrics
        await updatePlatformMetrics(outreachData);

        return outreachDoc.id;
    } catch (error) {
        console.error("Error saving outreach:", error);
        throw new Error(`Failed to save outreach: ${error.message}`);
    }
}

// Function to update platform metrics
async function updatePlatformMetrics(outreachData) {
    try {
        const metricsRef = db.collection('metrics').doc('platformStats');
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

        const updateData = {
            totalEmailsGenerated: firebase.firestore.FieldValue.increment(1),
            [`businessTypeBreakdown.${outreachData.businessType}`]: firebase.firestore.FieldValue.increment(1),
            [`toneDistribution.${outreachData.tone}`]: firebase.firestore.FieldValue.increment(1),
            'metadata.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add to generation trends
        const trendData = {
            date: currentDate,
            businessType: outreachData.businessType,
            tone: outreachData.tone
        };

        // Perform the update
        await metricsRef.set({
            ...updateData,
            generationTrends: firebase.firestore.FieldValue.arrayUnion(trendData)
        }, { merge: true });

        console.log("Platform metrics updated successfully");
    } catch (error) {
        console.error("Error updating metrics:", error);
        // Don't throw error to prevent blocking the main outreach save
    }
}

// Function to get platform metrics
async function getPlatformMetrics() {
    try {
        const metricsDoc = await db.collection('metrics').doc('platformStats').get();
        
        if (!metricsDoc.exists) {
            console.log("No metrics document found");
            return null;
        }

        const metrics = metricsDoc.data();
        
        // Update UI elements if they exist
        const totalEmailsElement = document.querySelector('.stats-grid .stat-card:nth-child(1) h3');
        if (totalEmailsElement && metrics.totalEmailsGenerated !== undefined) {
            totalEmailsElement.textContent = metrics.totalEmailsGenerated;
        }

        return metrics;
    } catch (error) {
        console.error("Error retrieving metrics:", error);
        return null;
    }
}

// Function to validate outreach data
function validateOutreachData(data) {
    const requiredFields = ['businessType', 'service', 'recipientName', 'recipientLocation'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
}

// Function to handle outreach errors
function handleOutreachError(error) {
    console.error("Outreach Error:", error);
    
    // Show user-friendly error message
    const errorMessage = error.message || "An unexpected error occurred";
    alert(`Failed to save outreach: ${errorMessage}`);
    
    // You might want to implement more sophisticated error handling here
    return false;
}

// Export functions for use in other files
window.saveOutreachToFirestore = saveOutreachToFirestore;
window.updatePlatformMetrics = updatePlatformMetrics;
window.getPlatformMetrics = getPlatformMetrics;
window.validateOutreachData = validateOutreachData;
window.handleOutreachError = handleOutreachError;

// Initialize metrics on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await getPlatformMetrics();
    } catch (error) {
        console.error("Failed to initialize metrics:", error);
    }
});