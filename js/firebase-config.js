/**
 * Gramin Bharat TV - Firebase Cloud Integration Layer
 * Direct Firebase Storage file uploads, Cloud Firestore real-time sync, and LocalStorage failover.
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
        try {
          firebaseStorage = firebase.storage();
        } catch (stErr) {
          console.warn("Storage init notice:", stErr);
        }
      }

      isInitialized = true;
      lastError = null;
      console.log("🔥 Firebase & Storage initialized for project:", config.projectId);
      return true;
    } catch (err) {
      console.error("Firebase init error:", err);
      lastError = err;
      isInitialized = false;
      return false;
    }
  }

  // Direct Firebase Storage File Uploader
  async function uploadFileToFirebaseStorage(file, folderPath) {
    if (!file) return null;

    if (!firebaseStorage && firebase && firebase.storage) {
      try {
        firebaseStorage = firebase.storage();
      } catch (e) {}
    }

    if (!isInitialized || !firebaseStorage) {
      console.warn("Firebase Storage not available, using fallback.");
      return null;
    }

    try {
      const cleanFileName = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
      const fullPath = `${folderPath}/${Date.now()}_${cleanFileName}`;
      const storageRef = firebaseStorage.ref().child(fullPath);

      const metadata = {
        contentType: file.type || "application/octet-stream",
        customMetadata: {
          originalName: file.name || "upload",
          uploadedAt: new Date().toISOString()
        }
      };

      console.log(`📤 Uploading to Firebase Storage: ${fullPath} (${Math.round(file.size / 1024)} KB)...`);
      const uploadTask = await storageRef.put(file, metadata);
      const downloadUrl = await uploadTask.ref.getDownloadURL();
      console.log(`✅ Upload success! Firebase Storage URL:`, downloadUrl);
      
      return {
        url: downloadUrl,
        path: fullPath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (err) {
      console.warn("Firebase Storage upload notice (will use local fallback):", err.message || err);
      return null;
    }
  }

  // Client-side image compressor fallback
  function convertImageToBase64(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
      if (!file) {
        resolve(null);
        return;
      }
      if (!file.type || !file.type.startsWith("image/")) {
        if (file.size < 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL("image/jpeg", quality);
              resolve(dataUrl);
            } catch (canvasErr) {
              resolve(e.target.result);
            }
          };
          img.onerror = () => resolve(e.target.result);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } catch (err) {
        resolve(null);
      }
    });
  }

  // Save registration with Firebase Storage Uploads & Cloud Firestore Persistence
  async function saveRegistration(regData, fileMap = {}) {
    const record = { ...regData };
    const uploadedDocs = { ...record.documentsAttached };
    const regRefId = regData.regId || `REG-${Date.now()}`;

    // 1. Upload files to Firebase Storage
    try {
      // 1.1 Sarpanch Photo
      if (fileMap.sarpanchPhoto) {
        const storageResult = await uploadFileToFirebaseStorage(fileMap.sarpanchPhoto, `sarpanch_uploads/${regRefId}/photos`);
        if (storageResult && storageResult.url) {
          uploadedDocs.sarpanchPhotoUrl = storageResult.url;
          uploadedDocs.sarpanchPhotoStoragePath = storageResult.path;
        } else {
          const b64 = await convertImageToBase64(fileMap.sarpanchPhoto, 600, 0.75);
          if (b64) uploadedDocs.sarpanchPhotoUrl = b64;
        }
      }

      // 1.2 ID Proof
      if (fileMap.idProof) {
        const storageResult = await uploadFileToFirebaseStorage(fileMap.idProof, `sarpanch_uploads/${regRefId}/id_proofs`);
        if (storageResult && storageResult.url) {
          uploadedDocs.idProofUrl = storageResult.url;
          uploadedDocs.idProofStoragePath = storageResult.path;
        } else {
          const b64 = await convertImageToBase64(fileMap.idProof, 800, 0.75);
          if (b64) uploadedDocs.idProofUrl = b64;
        }
      }

      // 1.3 Works Photos
      if (fileMap.worksPhotos && fileMap.worksPhotos.length > 0) {
        uploadedDocs.worksPhotosUrls = [];
        for (let i = 0; i < fileMap.worksPhotos.length; i++) {
          const f = fileMap.worksPhotos[i];
          const storageResult = await uploadFileToFirebaseStorage(f, `sarpanch_uploads/${regRefId}/works`);
          if (storageResult && storageResult.url) {
            uploadedDocs.worksPhotosUrls.push(storageResult.url);
          } else {
            const b64 = await convertImageToBase64(f, 800, 0.7);
            if (b64) uploadedDocs.worksPhotosUrls.push(b64);
          }
        }
      }

      // 1.4 Certificates
      if (fileMap.certificates) {
        const storageResult = await uploadFileToFirebaseStorage(fileMap.certificates, `sarpanch_uploads/${regRefId}/certificates`);
        if (storageResult && storageResult.url) {
          uploadedDocs.certificatesUrl = storageResult.url;
          uploadedDocs.certificatesStoragePath = storageResult.path;
        } else {
          const b64 = await convertImageToBase64(fileMap.certificates, 800, 0.75);
          if (b64) uploadedDocs.certificatesUrl = b64;
        }
      }
    } catch (uploadErr) {
      console.warn("Storage upload pipeline notice:", uploadErr);
    }

    record.documentsAttached = uploadedDocs;

    // 2. Save directly to LocalStorage
    try {
      const localList = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
      const existingIdx = localList.findIndex(r => r.id === record.id || r.regId === record.regId);
      if (existingIdx >= 0) {
        localList[existingIdx] = record;
      } else {
        localList.unshift(record);
      }
      localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(localList));
    } catch (e) {
      console.warn("LocalStorage save notice:", e);
    }

    // 3. Write directly to Cloud Firestore
    if (isInitialized && firestoreDb) {
      try {
        const docRef = await firestoreDb.collection(COLLECTION_REGISTRATIONS).add({
          ...record,
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("✓ Registration written to Cloud Firestore ID:", docRef.id);
        record.firestoreDocId = docRef.id;

        // Update local mirror with doc ID
        const localList = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
        const idx = localList.findIndex(r => r.id === record.id || r.regId === record.regId);
        if (idx >= 0) {
          localList[idx].firestoreDocId = docRef.id;
          localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(localList));
        }
      } catch (err) {
        console.warn("Firestore write notice (data safely saved locally):", err.message || err);
      }
    }

    return record;
  }

  // Real-time listener for Sarpanch Registrations (for Admin Panel)
  function listenRegistrations(onUpdate, onError) {
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

          cloudList.sort((a, b) => (b.id || 0) - (a.id || 0));

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
          console.warn("Firestore listener notice:", err.message || err);
          if (onError) onError(err);
          const fallbackLocal = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
          onUpdate(fallbackLocal, false);
        });
    } catch (e) {
      console.warn("Listener setup notice:", e);
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
        console.warn("Firestore delete notice:", err.message || err);
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
        console.warn("Firestore CMS save notice:", err.message || err);
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
        console.warn("CMS listener fallback:", err.message || err);
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
    uploadFile: uploadFileToFirebaseStorage,
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
