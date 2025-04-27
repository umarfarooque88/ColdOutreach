// Diagnostic Function for Firestore Connection
function firebaseDiagnostic() {
    console.group("🔍 Firebase Diagnostic");
    
    // Check Firebase Initialization
    if (!firebase.apps.length) {
        console.error("❌ Firebase not initialized");
        return false;
    }
    console.log("✅ Firebase Initialized");

    // Check Firestore
    if (!firebase.firestore) {
        console.error("❌ Firestore not loaded");
        return false;
    }
    console.log("✅ Firestore Loaded");

    return true;
}

// Comprehensive Collection Creation Diagnostic
async function diagnosticCollectionCreation() {
    try {
        // Verify Firebase connection
        if (!firebaseDiagnostic()) {
            throw new Error("Firebase not properly initialized");
        }

        const db = firebase.firestore();
        
        // Test Outreaches Collection
        const outreachesRef = db.collection('outreaches');
        const outreachDoc = await outreachesRef.add({
            testField: "Diagnostic Test",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Outreaches Collection Write Successful");
        console.log("Test Document ID:", outreachDoc.id);

        // Test Metrics Collection
        const metricsRef = db.collection('metrics').doc('platformStats');
        await metricsRef.set({
            testField: "Diagnostic Test",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Metrics Collection Write Successful");

        console.groupEnd();
        return true;
    } catch (error) {
        console.error("❌ Collection Creation Diagnostic Failed:", error);
        console.groupEnd();
        return false;
    }
}

// Firestore Collection Initialization
function initializeFirestoreCollections() {
    // Reference to Firestore
    const db = firebase.firestore();

    // Create Outreaches Collection
    const outreachesRef = db.collection('outreaches');
    
    // Create initial document in Outreaches Collection
    outreachesRef.add({
        userId: 'system_init',
        businessType: 'Initial Setup',
        service: 'System Initialization',
        recipientName: 'System',
        recipientLocation: 'Global',
        subjectLine: 'Initial Collection Setup',
        emailContent: 'This is an initial document to ensure collection exists',
        tone: 'professional',
        generatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Initial outreach document created with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error creating initial outreach document: ", error);
    });

    // Create Metrics Collection
    const metricsRef = db.collection('metrics').doc('platformStats');
    
    // Set initial metrics document
    metricsRef.set({
        totalEmailsGenerated: 0,
        businessTypeBreakdown: {},
        toneDistribution: {
            professional: 0,
            friendly: 0,
            casual: 0,
            creative: 0
        },
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Initial metrics document created");
    })
    .catch((error) => {
        console.error("Error creating metrics document: ", error);
    });
}

// Initialization on page load
document.addEventListener('DOMContentLoaded', () => {
    // Perform initial diagnostic
    firebaseDiagnostic();
});

// Call initialization when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    if (firebase.apps.length > 0) {
        initializeFirestoreCollections();
    } else {
        console.error("Firebase not initialized");
    }
});

function firebaseDiagnostic() {
    console.group("🔍 Firebase Diagnostic");
    
    // Check Firebase Initialization
    console.log("Firebase Apps:", firebase.apps);
    
    // Firestore Instance Check
    const db = firebase.firestore();
    console.log("Firestore Instance:", db);
    
    console.groupEnd();
}

// Call diagnostic on page load
document.addEventListener('DOMContentLoaded', firebaseDiagnostic);