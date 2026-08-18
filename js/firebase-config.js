/**
 * Gramin Bharat TV - Robust Firebase Cloud Integration Layer
 * Provides Cloud Firestore real-time sync, Firebase Storage uploads, and LocalStorage failover.
 */

(function (window) {
  "use strict";

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
  let lastError = null;

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
      isInitialized = false;
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
      lastError = null;
      console.log("🔥 Firebase initialized for project:", config.projectId);
      return true;
    } catch (err) {
      console.error("Firebase init error:", err);
      lastError = err;
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
      console.warn("Firebase Storage upload notice (using local metadata):", err.message || err);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: null
      };
    }
  }

  // Save registration to Cloud Firestore and mirror to LocalStorage
  async function saveRegistration(regData, fileMap = {}) {
    const record = { ...regData };
    const uploadedDocs = { ...record.documentsAttached };

    // 1. Immediately guarantee local persistence
    try {
      const localList = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
      const existingIdx = localList.findIndex(r => r.id === record.id || r.regId === record.regId);
      if (existingIdx >= 0) {
        localList[existingIdx] = record;
      } else {
        localList.unshift(record);
      }
      localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(localList));
      console.log("✓ Registration saved to LocalStorage:", record.regId);
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    // 2. Upload files if storage is active
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
        console.warn("File upload warning:", uploadErr);
      }

      record.documentsAttached = uploadedDocs;
    }

    // 3. Save to Cloud Firestore
    if (isInitialized && firestoreDb) {
      try {
        const docRef = await firestoreDb.collection(COLLECTION_REGISTRATIONS).add({
          ...record,
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("✓ Registration written to Cloud Firestore ID:", docRef.id);
        record.firestoreDocId = docRef.id;

        // Update local record with firestoreDocId
        const localList = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
        const idx = localList.findIndex(r => r.id === record.id || r.regId === record.regId);
        if (idx >= 0) {
          localList[idx].firestoreDocId = docRef.id;
          localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(localList));
        }
      } catch (err) {
        console.warn("Firestore write error (data remains safe in LocalStorage):", err.message || err);
      }
    }

    return record;
  }

  // Real-time listener for Sarpanch Registrations (for Admin Panel)
  function listenRegistrations(onUpdate, onError) {
    // 1. Immediately provide local data first
    const local = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
    onUpdate(local, false);

    if (!isInitialized || !firestoreDb) {
      return () => {};
    }

    try {
      return firestoreDb.collection(COLLECTION_REGISTRATIONS)
        .onSnapshot(snapshot => {
          const cloudList = [];
          snapshot.forEach(doc => {
            cloudList.push({ firestoreDocId: doc.id, ...doc.data() });
          });

          // Sort by id descending
          cloudList.sort((a, b) => (b.id || 0) - (a.id || 0));

          // Merge with any local submissions not yet synced
          const currentLocal = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
          const merged = [...cloudList];
          
          currentLocal.forEach(localItem => {
            const existsInCloud = merged.some(c => c.id === localItem.id || (c.regId && c.regId === localItem.regId));
            if (!existsInCloud) {
              merged.push(localItem);
            }
          });

          merged.sort((a, b) => (b.id || 0) - (a.id || 0));
          localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(merged));
          onUpdate(merged, cloudList.length > 0);
        }, err => {
          console.warn("Firestore registrations onSnapshot notice:", err.message || err);
          if (onError) onError(err);
          const fallbackLocal = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
          onUpdate(fallbackLocal, false);
        });
    } catch (e) {
      console.warn("Listener init error:", e);
      return () => {};
    }
  }

  // Delete registration from Firestore & LocalStorage
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
        console.warn("Firestore delete error:", err.message || err);
      }
    }

    let list = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
    list = list.filter(r => r.id != regId && (!firestoreDocId || r.firestoreDocId != firestoreDocId));
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
        console.warn("Firestore CMS save error:", err.message || err);
      }
    }
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
        console.warn("CMS listener fallback to local:", err.message || err);
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

  function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    return initFirebase(config);
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
    isInitialized = false;
  }

  // Public API
  window.gbtvFirebase = {
    init: initFirebase,
    isConfigured: () => isInitialized,
    getLastError: () => lastError,
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
