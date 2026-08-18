/**
 * Gramin Bharat TV - Firebase Cloud Integration Layer
 * Provides Cloud Firestore real-time sync, Firebase Storage uploads, and LocalStorage fallback.
 */

(function (window) {
  "use strict";

  // Default Firebase configuration (can be updated dynamically from Admin Panel)
  const DEFAULT_CONFIG = {
    apiKey: "AIzaSyD98PCS75kiEBAwM-bDVb4cQTudvKA__nA",
    authDomain: "gramin-bharat-tv-20e13.firebaseapp.com",
    projectId: "gramin-bharat-tv-20e13",
    storageBucket: "gramin-bharat-tv-20e13.firebasestorage.app",
    messagingSenderId: "719676376816",
    appId: "1:719676376816:web:d0a7537b17cfbf94e4a435"
  };

  const STORAGE_KEY_FIREBASE_CONFIG = "GBTV_FIREBASE_CONFIG";
  const COLLECTION_REGISTRATIONS = "sarpanch_registrations";
  const DOC_CMS_STORE = "site_content";
  const DOC_CMS_STORE_ID = "live_store";

  let firebaseApp = null;
  let firestoreDb = null;
  let firebaseStorage = null;
  let isInitialized = false;

  function getStoredConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.apiKey && parsed.apiKey.trim() !== "") {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read stored Firebase config:", e);
    }
    return DEFAULT_CONFIG;
  }

  function isConfigValid(cfg) {
    return !!(cfg && cfg.apiKey && cfg.projectId && cfg.apiKey.trim() !== "" && cfg.projectId.trim() !== "");
  }

  function initFirebase(customConfig = null) {
    const config = customConfig || getStoredConfig();
    
    if (!isConfigValid(config)) {
      isInitialized = false;
      return false;
    }

    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK not loaded from CDN.");
      return false;
    }

    try {
      if (firebase.apps && firebase.apps.length > 0) {
        firebaseApp = firebase.apps[0];
      } else {
        firebaseApp = firebase.initializeApp(config);
      }

      firestoreDb = firebase.firestore();
      if (firebase.storage) {
        firebaseStorage = firebase.storage();
      }

      isInitialized = true;
      console.log("🔥 Firebase successfully initialized for project:", config.projectId);
      return true;
    } catch (err) {
      console.error("Firebase init error:", err);
      isInitialized = false;
      return false;
    }
  }

  // Upload a single file to Firebase Storage
  async function uploadFile(file, path) {
    if (!isInitialized || !firebaseStorage || !file) {
      return null;
    }
    try {
      const storageRef = firebaseStorage.ref().child(path);
      const snapshot = await storageRef.put(file);
      const downloadUrl = await snapshot.ref.getDownloadURL();
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: downloadUrl,
        path: path
      };
    } catch (err) {
      console.warn("Firebase Storage upload failed (falling back to metadata):", err);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: null
      };
    }
  }

  // Save registration to Cloud Firestore and upload attached files
  async function saveRegistration(regData, fileMap = {}) {
    const record = { ...regData };
    const uploadedDocs = { ...record.documentsAttached };

    // Upload files if storage is active
    if (isInitialized && firebaseStorage && fileMap) {
      const regRefId = regData.regId || `REG-${Date.now()}`;
      
      try {
        if (fileMap.sarpanchPhoto) {
          const res = await uploadFile(fileMap.sarpanchPhoto, `sarpanch_uploads/${regRefId}/photo_${fileMap.sarpanchPhoto.name}`);
          if (res && res.url) uploadedDocs.sarpanchPhotoUrl = res.url;
        }
        if (fileMap.idProof) {
          const res = await uploadFile(fileMap.idProof, `sarpanch_uploads/${regRefId}/id_${fileMap.idProof.name}`);
          if (res && res.url) uploadedDocs.idProofUrl = res.url;
        }
        if (fileMap.worksPhotos && fileMap.worksPhotos.length > 0) {
          uploadedDocs.worksPhotosUrls = [];
          for (let i = 0; i < fileMap.worksPhotos.length; i++) {
            const f = fileMap.worksPhotos[i];
            const res = await uploadFile(f, `sarpanch_uploads/${regRefId}/work_${i + 1}_${f.name}`);
            if (res && res.url) uploadedDocs.worksPhotosUrls.push(res.url);
          }
        }
        if (fileMap.certificates) {
          const res = await uploadFile(fileMap.certificates, `sarpanch_uploads/${regRefId}/cert_${fileMap.certificates.name}`);
          if (res && res.url) uploadedDocs.certificatesUrl = res.url;
        }
      } catch (uploadErr) {
        console.warn("File upload notice:", uploadErr);
      }

      record.documentsAttached = uploadedDocs;
    }

    // Save to Cloud Firestore
    if (isInitialized && firestoreDb) {
      try {
        const docRef = await firestoreDb.collection(COLLECTION_REGISTRATIONS).add({
          ...record,
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("✓ Registration written to Cloud Firestore with ID:", docRef.id);
        record.firestoreDocId = docRef.id;
      } catch (err) {
        console.error("Failed to write to Cloud Firestore (falling back to LocalStorage):", err);
      }
    }

    // Always mirror to LocalStorage
    try {
      const localList = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
      localList.unshift(record);
      localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(localList));
    } catch (e) {
      console.warn("LocalStorage mirror error:", e);
    }

    return record;
  }

  // Real-time listener for Sarpanch Registrations (for Admin Panel)
  function listenRegistrations(onUpdate, onError) {
    if (!isInitialized || !firestoreDb) {
      const local = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
      onUpdate(local, false);
      return () => {};
    }

    try {
      return firestoreDb.collection(COLLECTION_REGISTRATIONS)
        .orderBy("id", "desc")
        .onSnapshot(snapshot => {
          const list = [];
          snapshot.forEach(doc => {
            list.push({ firestoreDocId: doc.id, ...doc.data() });
          });
          localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(list));
          onUpdate(list, true);
        }, err => {
          console.error("Firestore registrations listener error:", err);
          if (onError) onError(err);
          const local = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
          onUpdate(local, false);
        });
    } catch (e) {
      console.warn("Listener setup error:", e);
      const local = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
      onUpdate(local, false);
      return () => {};
    }
  }

  // Delete registration from Firestore
  async function deleteRegistration(regId, firestoreDocId = null) {
    if (isInitialized && firestoreDb) {
      try {
        if (firestoreDocId) {
          await firestoreDb.collection(COLLECTION_REGISTRATIONS).doc(firestoreDocId).delete();
        } else {
          const snapshot = await firestoreDb.collection(COLLECTION_REGISTRATIONS).where("id", "==", regId).get();
          snapshot.forEach(doc => doc.ref.delete());
        }
      } catch (err) {
        console.error("Firestore delete error:", err);
      }
    }

    // Local mirror delete
    let list = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
    list = list.filter(r => r.id != regId && r.firestoreDocId != firestoreDocId);
    localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(list));
  }

  // Save Website CMS Data to Cloud Firestore
  async function saveCmsData(cmsData) {
    if (isInitialized && firestoreDb) {
      try {
        await firestoreDb.collection(DOC_CMS_STORE).doc(DOC_CMS_STORE_ID).set({
          data: cmsData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("✓ CMS Store synced to Cloud Firestore");
      } catch (err) {
        console.error("Firestore CMS save error:", err);
      }
    }
    // Always mirror to LocalStorage
    localStorage.setItem("GBTV_CMS_DATA_STORE_V1", JSON.stringify(cmsData));
  }

  // Real-time CMS sync for Live Website
  function listenCmsData(onUpdate) {
    if (!isInitialized || !firestoreDb) {
      const local = JSON.parse(localStorage.getItem("GBTV_CMS_DATA_STORE_V1") || "null");
      if (local) onUpdate(local, false);
      return () => {};
    }

    try {
      return firestoreDb.collection(DOC_CMS_STORE).doc(DOC_CMS_STORE_ID).onSnapshot(doc => {
        if (doc.exists && doc.data()?.data) {
          const cloudData = doc.data().data;
          localStorage.setItem("GBTV_CMS_DATA_STORE_V1", JSON.stringify(cloudData));
          onUpdate(cloudData, true);
        } else {
          const local = JSON.parse(localStorage.getItem("GBTV_CMS_DATA_STORE_V1") || "null");
          if (local) onUpdate(local, false);
        }
      }, err => {
        console.warn("CMS listener fallback to local:", err);
        const local = JSON.parse(localStorage.getItem("GBTV_CMS_DATA_STORE_V1") || "null");
        if (local) onUpdate(local, false);
      });
    } catch (e) {
      const local = JSON.parse(localStorage.getItem("GBTV_CMS_DATA_STORE_V1") || "null");
      if (local) onUpdate(local, false);
      return () => {};
    }
  }

  // Test Firebase connection with given config
  async function testConnection(config) {
    if (!isConfigValid(config)) {
      throw new Error("Invalid configuration. API Key and Project ID are required.");
    }
    
    const testAppName = `test-${Date.now()}`;
    const testApp = firebase.initializeApp(config, testAppName);
    try {
      const testDb = testApp.firestore();
      await testDb.collection("_healthcheck").doc("ping").set({
        ping: true,
        timestamp: new Date().toISOString()
      });
      await testApp.delete();
      return true;
    } catch (err) {
      try { await testApp.delete(); } catch(e) {}
      throw err;
    }
  }

  // Save config from Admin Panel
  function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    return initFirebase(config);
  }

  // Clear config
  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
    isInitialized = false;
  }

  // Public API
  window.gbtvFirebase = {
    init: initFirebase,
    isConfigured: () => isInitialized,
    getConfig: getStoredConfig,
    saveConfig: saveConfig,
    clearConfig: clearConfig,
    testConnection: testConnection,
    saveRegistration: saveRegistration,
    listenRegistrations: listenRegistrations,
    deleteRegistration: deleteRegistration,
    saveCmsData: saveCmsData,
    listenCmsData: listenCmsData
  };

  // Auto initialize on script load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initFirebase());
  } else {
    initFirebase();
  }

})(window);
