/**
 * Eye Of Ru Enterprises — Universal Client Google Drive, Leads & Ingestion Webhook
 * Automated endpoint for client folder scaffolding, PDF audits, lead sheets, and lead notifications.
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "ERROR", message: "Missing POST payload" });
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || "UPLOAD_AUDIT";
    var clientName = sanitizeName(data.clientName || "General Client");

    // Route 1: Test Email Verification
    if (action === "TEST_EMAIL") {
      var toEmail = data.toEmail || "agency@eyeofruenterprisesllc.com";
      var testSubject = "Eye Of Ru Test Transmission from agency@";
      var testHtml = "<div style='font-family:sans-serif;padding:20px;background:#0d0f12;color:#f8fafc;border-radius:8px;'>" +
        "<h2 style='color:#c89b4e;margin-top:0;'>Eye Of Ru Enterprises</h2>" +
        "<p>This is a verified test email sent via Google Apps Script.</p>" +
        "<p><strong>Configured Sender Alias:</strong> agency@eyeofruenterprisesllc.com</p>" +
        "<p><strong>Timestamp:</strong> " + new Date().toString() + "</p>" +
        "</div>";

      var emailResult = sendAgencyEmail(toEmail, toEmail, testSubject, testHtml);
      var aliases = [];
      try { aliases = GmailApp.getAliases(); } catch (aErr) {}

      return jsonResponse({
        status: emailResult.success ? "SUCCESS" : "ERROR",
        action: "TEST_EMAIL",
        sentTo: toEmail,
        emailSent: emailResult.success,
        emailResult: emailResult,
        senderUsed: emailResult.fromUsed,
        availableAliases: aliases
      });
    }

    // Establish Master Client Folder Hierarchy
    var clientFolders = getClientFolderTree(clientName);

    // Route 2: Upload Audit PDF
    if (action === "UPLOAD_AUDIT") {
      var fileName = data.fileName || (clientName + "_Audit_Report_" + Utilities.formatDate(new Date(), "America/New_York", "yyyy-MM-dd") + ".pdf");
      var pdfBytes = Utilities.base64Decode(data.base64Pdf);
      var pdfBlob = Utilities.newBlob(pdfBytes, "application/pdf", fileName);

      var auditFile = clientFolders.audits.createFile(pdfBlob);
      auditFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return jsonResponse({
        status: "SUCCESS",
        action: "UPLOAD_AUDIT",
        clientName: clientName,
        fileName: fileName,
        fileUrl: auditFile.getUrl(),
        downloadUrl: auditFile.getDownloadUrl(),
        folderUrl: clientFolders.audits.getUrl(),
        clientRootUrl: clientFolders.clientRoot.getUrl()
      });
    }

    // Route 3: Initialize Client Hierarchy & Operational Sheet
    else if (action === "INIT_CLIENT") {
      var sheetData = getOrCreateClientSheet(clientFolders, clientName);

      return jsonResponse({
        status: "SUCCESS",
        action: "INIT_CLIENT",
        clientName: clientName,
        clientRootUrl: clientFolders.clientRoot.getUrl(),
        spreadsheetUrl: sheetData.ss.getUrl(),
        spreadsheetId: sheetData.ss.getId(),
        subfolders: {
          audits: clientFolders.audits.getUrl(),
          brandAssets: clientFolders.brand.getUrl(),
          dataSheets: clientFolders.data.getUrl(),
          handoff: clientFolders.handoff.getUrl()
        }
      });
    }

    // Route 4: Submit Lead from Client Website Contact Form
    else if (action === "SUBMIT_LEAD") {
      var sheetData = getOrCreateClientSheet(clientFolders, clientName);
      var leadsSheet = sheetData.ss.getSheetByName("Leads") || sheetData.ss.getSheets()[0];

      var timestamp = new Date();
      var fullName = data.fullName || data.name || "Anonymous";
      var email = data.email || "";
      var phone = data.phone || "";
      var subject = data.subject || "General Inquiry";
      var message = data.message || "";
      var turnstile = data.turnstileVerified ? "VERIFIED" : "UNVERIFIED";

      leadsSheet.appendRow([timestamp, fullName, email, phone, subject, message, "New Lead", turnstile]);

      // Dispatch Email Notification to Business Owner
      var notifyEmail = data.notifyEmail || "agency@eyeofruenterprisesllc.com";
      var leadSubject = "[NEW LEAD] " + fullName + " (" + clientName + ")";
      var leadHtml = "<div style='font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#0d0f12;color:#e2e8f0;border-radius:12px;border:1px solid #c89b4e;'>" +
        "<h2 style='color:#c89b4e;margin-top:0;font-size:20px;'>New Website Inquiry Received</h2>" +
        "<p style='color:#94a3b8;font-size:13px;'>The following lead was submitted through the " + clientName + " website:</p>" +
        "<div style='background:#14181e;padding:16px;border-radius:8px;margin:16px 0;'>" +
        "<p style='margin:6px 0;'><strong>Full Name:</strong> " + fullName + "</p>" +
        "<p style='margin:6px 0;'><strong>Email:</strong> <a href='mailto:" + email + "' style='color:#c89b4e;'>" + email + "</a></p>" +
        "<p style='margin:6px 0;'><strong>Phone:</strong> <a href='tel:" + phone + "' style='color:#c89b4e;'>" + phone + "</a></p>" +
        "<p style='margin:6px 0;'><strong>Subject:</strong> " + subject + "</p>" +
        "<p style='margin:6px 0;'><strong>Message:</strong></p>" +
        "<blockquote style='margin:8px 0 0 0;padding-left:12px;border-left:3px solid #c89b4e;color:#cbd5e1;'>" + message + "</blockquote>" +
        "</div>" +
        (email ? "<div style='margin:14px 0;'><a href='mailto:" + encodeURIComponent(email) + "?subject=Re:%20" + encodeURIComponent(subject) + "' style='background:#c89b4e;color:#0d0f12;text-decoration:none;font-weight:bold;font-size:12px;padding:9px 16px;border-radius:6px;display:inline-block;'>Reply to " + escapeHtml(fullName) + " (" + escapeHtml(email) + ") ↗</a></div>" : "") +
        "<p style='font-size:12px;color:#64748b;'>Hit 'Reply' directly to respond to " + fullName + ".</p>" +
        "<div style='margin-top:20px;padding-top:12px;border-top:1px solid #2c3543;font-size:11px;color:#64748b;'>" +
        "Logged to Google Sheet: <a href='" + sheetData.ss.getUrl() + "' style='color:#c89b4e;'>View Lead Sheet</a>" +
        "</div>" +
        "</div>";

      var emailResult = sendAgencyEmail(notifyEmail, email, leadSubject, leadHtml);

      return jsonResponse({
        status: "SUCCESS",
        action: "SUBMIT_LEAD",
        clientName: clientName,
        leadLogged: true,
        notificationSentTo: notifyEmail,
        senderUsed: emailResult.fromUsed
      });
    }

    // Route 5: Upload Brand Assets / Media (Hardened 4-Layer Inspection)
    else if (action === "UPLOAD_ASSET") {
      var rawBase64 = data.base64Data || data.base64 || data.data || "";
      if (typeof rawBase64 !== "string" || !rawBase64.trim()) {
        return jsonResponse({ status: "ERROR", message: "Missing or invalid base64 image payload." });
      }

      // Pre-decode payload size check (25MB binary is ~33.5MB base64)
      if (rawBase64.length > 35 * 1024 * 1024) {
        return jsonResponse({
          status: "ERROR",
          message: "Payload size exceeds maximum allowed upload threshold (25MB limit)."
        });
      }

      if (rawBase64.indexOf("base64,") > -1) {
        rawBase64 = rawBase64.split("base64,")[1];
      }
      rawBase64 = rawBase64.replace(/\s+/g, "");

      var assetBytes;
      try {
        assetBytes = Utilities.base64Decode(rawBase64);
      } catch (decodeErr) {
        return jsonResponse({
          status: "ERROR",
          message: "Base64 decode failed: corrupted or malformed byte stream."
        });
      }

      // Quota Guard: Enforce decoded size <= 25MB
      var maxDecodedBytes = 25 * 1024 * 1024;
      if (!assetBytes || assetBytes.length === 0) {
        return jsonResponse({ status: "ERROR", message: "Empty byte payload received." });
      }
      if (assetBytes.length > maxDecodedBytes) {
        return jsonResponse({
          status: "ERROR",
          message: "Security violation: Decoded asset (" + (assetBytes.length / (1024 * 1024)).toFixed(2) + "MB) exceeds maximum Apps Script ceiling (25MB)."
        });
      }

      // Layer 4 Binary Inspection: Verify magic bytes
      var detectedType = inspectImageBinaryHeader(assetBytes);
      if (!detectedType) {
        return jsonResponse({
          status: "ERROR",
          message: "Security violation: uploaded file binary signature does not match an approved image format."
        });
      }

      // Filename & Extension Sanitization: Enforce verified binary extension
      var originalFileName = data.fileName || ("Asset_" + new Date().getTime());
      var safeFileName = sanitizeAssetFileName(originalFileName, detectedType.extension);
      var safeMimeType = detectedType.mimeType;

      var assetBlob = Utilities.newBlob(assetBytes, safeMimeType, safeFileName);
      var assetFile = clientFolders.brand.createFile(assetBlob);
      assetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return jsonResponse({
        status: "SUCCESS",
        action: "UPLOAD_ASSET",
        fileName: safeFileName,
        originalFileName: originalFileName,
        mimeType: safeMimeType,
        detectedFormat: detectedType.format,
        fileSize: assetBytes.length,
        fileId: assetFile.getId(),
        fileUrl: assetFile.getUrl(),
        downloadUrl: assetFile.getDownloadUrl(),
        folderName: "02_Brand Assets & Media",
        folderUrl: clientFolders.brand.getUrl(),
        clientRootUrl: clientFolders.clientRoot.getUrl()
      });
    }

    // Route 6: Create or Update Site Copy Review Document in Client Drive Folder
    else if (action === "CREATE_DOC" || action === "UPLOAD_COPY_DOC") {
      var fileName = (data.title || (clientName + " — Website Copy & Content Corpus")) + ".md";
      var content = "";
      if (data.content) {
        content = data.content;
      } else if (data.sections && data.sections.length > 0) {
        content = "# " + (data.title || (clientName + " — Complete Website Copy & Content Corpus")) + "\n\n";
        content += "> **Client**: " + clientName + "  \n";
        content += "> **Generated**: " + Utilities.formatDate(new Date(), "America/New_York", "yyyy-MM-dd HH:mm:ss") + " EST  \n";
        content += "> **Status**: Executive Website Copy Corpus - Ready for Review & Sign-Off  \n\n---\n\n";

        for (var i = 0; i < data.sections.length; i++) {
          var sec = data.sections[i];
          content += "## " + sec.heading + "\n\n";
          if (sec.items && sec.items.length > 0) {
            for (var j = 0; j < sec.items.length; j++) {
              var itm = sec.items[j];
              content += "### " + (itm.label || ("Item " + (j + 1))) + "\n" + itm.value + "\n\n";
            }
          } else if (sec.content) {
            content += sec.content + "\n\n";
          }
        }
      }

      var targetFolder = clientFolders.data; // Default: 03_Data & Lead Sheets
      if (data.subfolder === "audits") targetFolder = clientFolders.audits;
      else if (data.subfolder === "root") targetFolder = clientFolders.clientRoot;
      else if (data.subfolder === "brand") targetFolder = clientFolders.brand;

      // Create or update file in client folder
      var existingFiles = targetFolder.getFilesByName(fileName);
      var file;
      if (existingFiles.hasNext()) {
        file = existingFiles.next();
        file.setContent(content);
      } else {
        file = targetFolder.createFile(fileName, content, MimeType.PLAIN_TEXT);
      }
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      // Also sync to Site_Copy tab in client operational spreadsheet
      var sheetData = getOrCreateClientSheet(clientFolders, clientName);
      var copySheet = sheetData.ss.getSheetByName("Site_Copy");
      if (!copySheet) {
        copySheet = sheetData.ss.insertSheet("Site_Copy");
      }
      copySheet.clear();
      copySheet.appendRow(["Section", "Field / Component", "Current Website Copy", "Client Review Notes / Edits"]);
      copySheet.getRange("A1:D1").setFontWeight("bold").setBackground("#0d0f12").setFontColor("#e5be7d");

      if (data.sections && data.sections.length > 0) {
        for (var s = 0; s < data.sections.length; s++) {
          var sObj = data.sections[s];
          if (sObj.items && sObj.items.length > 0) {
            for (var k = 0; k < sObj.items.length; k++) {
              copySheet.appendRow([sObj.heading, sObj.items[k].label || "", sObj.items[k].value || "", ""]);
            }
          }
        }
      }

      return jsonResponse({
        status: "SUCCESS",
        action: action,
        clientName: clientName,
        fileName: file.getName(),
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        spreadsheetUrl: sheetData.ss.getUrl(),
        folderName: targetFolder.getName(),
        folderUrl: targetFolder.getUrl(),
        folderPath: "Eye Of Ru Enterprises / Clients / " + clientName + " / " + targetFolder.getName()
      });
    }

    // Route 7: Retrieve Site Copy Review Notes & Comments from Google Docs & Drive
    else if (action === "GET_COPY_NOTES" || action === "READ_COPY_NOTES") {
      var sheetData = getOrCreateClientSheet(clientFolders, clientName);
      var copySheet = sheetData.ss.getSheetByName("Site_Copy");
      var rows = copySheet ? copySheet.getDataRange().getValues() : [];

      var token = ScriptApp.getOAuthToken();
      var foundFiles = [];
      var allComments = [];

      // Helper to inspect a folder
      function inspectFolder(folder, folderLabel) {
        var files = folder.getFiles();
        while (files.hasNext()) {
          var f = files.next();
          var fName = f.getName();
          var fId = f.getId();
          var fMime = f.getMimeType();
          var fUpdated = f.getLastUpdated();

          // Check if file is related to copy corpus or created recently
          if (fName.indexOf("Copy") > -1 || fName.indexOf("Corpus") > -1 || fMime === "application/vnd.google-apps.document") {
            var fileInfo = {
              id: fId,
              name: fName,
              mimeType: fMime,
              folder: folderLabel,
              lastUpdated: fUpdated,
              comments: [],
              bodyText: ""
            };

            // 1. Fetch Drive Comments via REST API
            try {
              var commentsUrl = "https://www.googleapis.com/drive/v3/files/" + fId + "/comments?fields=comments(id,content,quotedFileContent,author,createdTime,resolved,replies)";
              var resp = UrlFetchApp.fetch(commentsUrl, {
                headers: { "Authorization": "Bearer " + token },
                muteHttpExceptions: true
              });
              if (resp.getResponseCode() === 200) {
                var cJson = JSON.parse(resp.getContentText());
                if (cJson.comments) {
                  fileInfo.comments = cJson.comments;
                  for (var c = 0; c < cJson.comments.length; c++) {
                    allComments.push({
                      fileId: fId,
                      fileName: fName,
                      comment: cJson.comments[c]
                    });
                  }
                }
              } else {
                fileInfo.commentsError = resp.getContentText();
              }
            } catch (cErr) {
              fileInfo.commentsError = cErr.toString();
            }

            // 2. Fetch Document Text Body
            try {
              if (fMime === "application/vnd.google-apps.document") {
                var doc = DocumentApp.openById(fId);
                fileInfo.bodyText = doc.getBody().getText();
              } else if (fMime === MimeType.PLAIN_TEXT) {
                fileInfo.bodyText = f.getBlob().getDataAsString();
              }
            } catch (tErr) {
              fileInfo.bodyError = tErr.toString();
            }

            foundFiles.push(fileInfo);
          }
        }
      }

      inspectFolder(clientFolders.data, "03_Data & Lead Sheets");
      inspectFolder(clientFolders.clientRoot, "Client Root");
      inspectFolder(clientFolders.audits, "01_Audits & Proposals");

      // Also check the specific known fileId from earlier
      var knownFileId = "1L8cDH5z_ggiyoNk6nsisAlqPPwq3cdFU";
      var knownFileComments = [];
      try {
        var kResp = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + knownFileId + "/comments?fields=comments(id,content,quotedFileContent,author,createdTime,resolved,replies)", {
          headers: { "Authorization": "Bearer " + token },
          muteHttpExceptions: true
        });
        if (kResp.getResponseCode() === 200) {
          var kJson = JSON.parse(kResp.getContentText());
          if (kJson.comments) {
            knownFileComments = kJson.comments;
          }
        }
      } catch (kErr) {}

      // Inspect all files in the client folder hierarchy
      var allClientFiles = [];
      var dataFiles = clientFolders.data.getFiles();
      while (dataFiles.hasNext()) {
        var df = dataFiles.next();
        allClientFiles.push({
          id: df.getId(),
          name: df.getName(),
          mimeType: df.getMimeType(),
          size: df.getSize(),
          lastUpdated: df.getLastUpdated(),
          url: df.getUrl()
        });
      }

      var rootFiles = clientFolders.clientRoot.getFiles();
      while (rootFiles.hasNext()) {
        var rf = rootFiles.next();
        allClientFiles.push({
          id: rf.getId(),
          name: rf.getName(),
          mimeType: rf.getMimeType(),
          size: rf.getSize(),
          lastUpdated: rf.getLastUpdated(),
          url: rf.getUrl()
        });
      }

      // Also check files shared with this account
      var sharedFiles = [];
      var sIter = DriveApp.searchFiles("sharedWithMe = true and trashed = false");
      while (sIter.hasNext() && sharedFiles.length < 20) {
        var sFile = sIter.next();
        var sBody = "";
        try {
          if (sFile.getMimeType() === "application/vnd.google-apps.document") {
            sBody = DocumentApp.openById(sFile.getId()).getBody().getText();
          }
        } catch (eSb) {}
        sharedFiles.push({
          id: sFile.getId(),
          name: sFile.getName(),
          mimeType: sFile.getMimeType(),
          lastUpdated: sFile.getLastUpdated(),
          url: sFile.getUrl(),
          body: sBody
        });
      }

      // Check operational sheet rows for user notes
      var notesFromSheet = [];
      if (rows && rows.length > 0) {
        for (var r = 1; r < rows.length; r++) {
          if (rows[r][3] && rows[r][3].toString().trim().length > 0) {
            notesFromSheet.push({
              section: rows[r][0],
              field: rows[r][1],
              current: rows[r][2],
              notes: rows[r][3]
            });
          }
        }
      }

      return jsonResponse({
        status: "SUCCESS",
        action: action,
        clientName: clientName,
        rowCount: rows.length,
        notesFromSheet: notesFromSheet,
        allClientFiles: allClientFiles,
        sharedFiles: sharedFiles
      });
    }

    // Route 8: Submit Staging Proposal from Client AI Concierge (/concierge)
    else if (action === "SUBMIT_STAGING_REQUEST" || action === "STAGE_UPDATE") {
      var sheetData = getOrCreateClientSheet(clientFolders, clientName);
      var queueSheet = sheetData.ss.getSheetByName("Staging_Queue");
      if (!queueSheet) {
        queueSheet = sheetData.ss.insertSheet("Staging_Queue");
        queueSheet.appendRow(["Timestamp", "Client Name", "Target Section", "Field", "Current Value", "Proposed Value", "Status", "Client Rationale", "Submitted By", "Operator Notes"]);
        queueSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#0d0f12").setFontColor("#e5be7d");
      }

      var timestamp = new Date();
      var targetSection = data.targetSection || "General Site Content";
      var field = data.field || "Content Revision";
      var currentValue = data.currentValue || "[Production Baseline]";
      var proposedValue = data.proposedValue || "";
      var clientRationale = data.clientRationale || data.rationale || "";
      var submittedBy = data.submittedBy || data.clientId || "Authorized Client";
      var forcedStatus = data.flaggedStatus || data.status;

      // Risk Evaluation Heuristics
      var riskEval = evaluateUpdateRisk(targetSection, field, currentValue, proposedValue, clientRationale);

      // Expedited SLA & Asset Detection
      var combinedText = ((targetSection || "") + " " + (field || "") + " " + (proposedValue || "") + " " + (clientRationale || "")).toLowerCase();
      var isExpedited = (combinedText.indexOf("tomorrow") > -1 || combinedText.indexOf("urgent") > -1 || combinedText.indexOf("asap") > -1 || combinedText.indexOf("expedited") > -1 || data.isExpedited === true || data.sla === "24h");
      var isPhotoProposal = (combinedText.indexOf("photo") > -1 || combinedText.indexOf("image") > -1 || combinedText.indexOf("picture") > -1 || combinedText.indexOf("media") > -1 || combinedText.indexOf("asset") > -1);

      var initialStatus = forcedStatus || (riskEval.isHighRisk ? "REQUIRES_2STEP" : (isExpedited ? "EXPEDITED" : "PENDING_REVIEW"));

      var operatorNotes = "";
      if (riskEval.isHighRisk) {
        operatorNotes = "Auto-flagged: " + riskEval.reasons.join("; ");
      }
      if (isPhotoProposal || isExpedited) {
        var assetNote = "Assets stored in Client Drive: 02_Brand Assets & Media (" + clientFolders.brand.getUrl() + ")";
        if (isExpedited) {
          assetNote = "[🔥 EXPEDITED 24H SLA: NEEDED BY TOMORROW] " + assetNote;
        }
        operatorNotes = operatorNotes ? (operatorNotes + " | " + assetNote) : assetNote;
      }

      // Append row to Staging_Queue
      queueSheet.appendRow([
        timestamp,
        clientName,
        targetSection,
        field,
        currentValue,
        proposedValue,
        initialStatus,
        clientRationale,
        submittedBy,
        operatorNotes
      ]);

      // Dispatch High-Priority Email Notification to Agency
      var emailResult = sendStagingAlertEmail(
        clientName,
        targetSection,
        field,
        currentValue,
        proposedValue,
        clientRationale,
        submittedBy,
        initialStatus,
        riskEval,
        sheetData.ss.getUrl(),
        clientFolders.brand.getUrl()
      );

      return jsonResponse({
        status: "SUCCESS",
        action: "SUBMIT_STAGING_REQUEST",
        clientName: clientName,
        queueStatus: initialStatus,
        isExpedited: isExpedited,
        isPhotoProposal: isPhotoProposal,
        brandFolderUrl: clientFolders.brand.getUrl(),
        isHighRisk: riskEval.isHighRisk,
        riskReasons: riskEval.reasons,
        emailSent: emailResult.success,
        spreadsheetUrl: sheetData.ss.getUrl(),
        timestamp: timestamp.toISOString()
      });
    }

    // Route 9: Update Staged Proposal Status (Triage / Deploy / Reject / 2-Step)
    else if (action === "UPDATE_STAGING_STATUS") {
      var sheetData = getOrCreateClientSheet(clientFolders, clientName);
      var queueSheet = sheetData.ss.getSheetByName("Staging_Queue");
      if (!queueSheet) {
        return jsonResponse({ status: "ERROR", message: "Staging_Queue sheet not found" });
      }

      var rowIndex = data.rowIndex;
      var newStatus = data.newStatus || "VERIFIED";
      var operatorNotes = data.operatorNotes || "";
      var submittedBy = data.submittedBy || "";
      var targetSection = data.targetSection || "";
      var field = data.field || "";
      var proposedValue = data.proposedValue || "";

      var dataRange = queueSheet.getDataRange();
      var values = dataRange.getValues();
      var targetRow = -1;

      if (rowIndex && rowIndex > 1 && rowIndex <= values.length) {
        targetRow = rowIndex;
        targetSection = targetSection || values[rowIndex - 1][2];
        field = field || values[rowIndex - 1][3];
        proposedValue = proposedValue || values[rowIndex - 1][5];
        submittedBy = submittedBy || values[rowIndex - 1][8];
      } else {
        for (var r = values.length - 1; r >= 1; r--) {
          if ((!targetSection || values[r][2] === targetSection) && (!field || values[r][3] === field)) {
            targetRow = r + 1;
            proposedValue = proposedValue || values[r][5];
            submittedBy = submittedBy || values[r][8];
            break;
          }
        }
      }

      if (targetRow > 1) {
        queueSheet.getRange(targetRow, 7).setValue(newStatus);
        if (operatorNotes) {
          queueSheet.getRange(targetRow, 10).setValue(operatorNotes);
        }

        var clientNotified = false;
        if (newStatus === "DEPLOYED" && submittedBy) {
          sendClientDeploymentConfirmation(submittedBy, clientName, targetSection, field, proposedValue);
          clientNotified = true;
        }

        return jsonResponse({
          status: "SUCCESS",
          action: "UPDATE_STAGING_STATUS",
          rowUpdated: targetRow,
          newStatus: newStatus,
          clientNotified: clientNotified
        });
      }

      return jsonResponse({ status: "ERROR", message: "Matching row not found in queue" });
    }

    // Route 10: Fetch Live Staging Queue Items
    else if (action === "GET_STAGING_QUEUE") {
      var queueItems = getStagingQueueItems(clientFolders, clientName, data.includeArchived, data.limit);
      return jsonResponse({
        status: "SUCCESS",
        action: "GET_STAGING_QUEUE",
        clientName: clientName,
        count: queueItems.length,
        items: queueItems
      });
    }

    // Route 11: Fetch Client Leads / Inquiries
    else if (action === "GET_LEADS") {
      var leadItems = getLeadItems(clientFolders, clientName, data.includeArchived, data.limit);
      return jsonResponse({
        status: "SUCCESS",
        action: "GET_LEADS",
        clientName: clientName,
        count: leadItems.length,
        leads: leadItems
      });
    }

    // Route 12: Update Client Lead Status
    else if (action === "UPDATE_LEAD_STATUS") {
      var sheetData = getOrCreateClientSheet(clientFolders, clientName);
      var leadsSheet = sheetData.ss.getSheetByName("Leads") || sheetData.ss.getSheets()[0];
      if (!leadsSheet) {
        return jsonResponse({ status: "ERROR", message: "Leads sheet not found" });
      }

      var rowIndex = data.rowIndex;
      var newStatus = data.newStatus || "Contacted";
      var email = data.email || "";
      var timestamp = data.timestamp || "";

      var values = leadsSheet.getDataRange().getValues();
      var targetRow = -1;

      if (rowIndex && rowIndex > 1 && rowIndex <= values.length) {
        targetRow = rowIndex;
      } else if (email || timestamp) {
        for (var r = values.length - 1; r >= 1; r--) {
          var rowEmail = values[r][2] ? values[r][2].toString().toLowerCase().trim() : "";
          var rowTimestamp = values[r][0] ? values[r][0].toString() : "";
          if (email && rowEmail === email.toLowerCase().trim()) {
            targetRow = r + 1;
            break;
          }
          if (timestamp && rowTimestamp === timestamp.toString()) {
            targetRow = r + 1;
            break;
          }
        }
      }

      if (targetRow > 1) {
        leadsSheet.getRange(targetRow, 7).setValue(newStatus);
        return jsonResponse({
          status: "SUCCESS",
          action: "UPDATE_LEAD_STATUS",
          clientName: clientName,
          rowIndex: targetRow,
          newStatus: newStatus
        });
      }

      return jsonResponse({ status: "ERROR", message: "Matching lead row not found in Leads sheet" });
    }

    // Route 13: Clean & Archive Aged Records (>30 Days Closed / Deployed / Rejected)
    else if (action === "ARCHIVE_OLD_RECORDS") {
      var archiveResult = archiveOldRecords(clientFolders, clientName);
      return jsonResponse(archiveResult);
    }

    return jsonResponse({ status: "ERROR", message: "Unknown action: " + action });

  } catch (err) {
    return jsonResponse({ status: "ERROR", message: err.toString() });
  }
}

/**
 * Sends email using GmailApp forcing agency@eyeofruenterprisesllc.com alias
 */
function sendAgencyEmail(recipient, customerEmail, subject, htmlBody) {
  try {
    var targetAlias = "agency@eyeofruenterprisesllc.com";

    // Prevent Gmail spam classification: never set reply-to to reserved dummy/test domains (RFC 2606)
    var safeReplyTo = targetAlias;
    if (customerEmail && customerEmail.indexOf("@") > -1) {
      var emailDomain = customerEmail.split("@")[1].toLowerCase();
      var isDummy = (emailDomain === "example.com" || emailDomain === "test.com" || emailDomain === "invalid" || emailDomain.indexOf("example") > -1);
      if (!isDummy) {
        safeReplyTo = customerEmail;
      }
    }

    var options = {
      name: "Eye Of Ru Enterprises",
      replyTo: safeReplyTo,
      htmlBody: htmlBody
    };

    var aliases = [];
    try { aliases = GmailApp.getAliases(); } catch (aErr) {}
    var fromUsed = "";
    try { fromUsed = Session.getActiveUser().getEmail(); } catch (uErr) {}

    if (aliases && aliases.indexOf(targetAlias) > -1) {
      options.from = targetAlias;
      fromUsed = targetAlias;
    } else if (aliases && aliases.length > 0) {
      options.from = aliases[0];
      fromUsed = aliases[0];
    }

    try {
      GmailApp.sendEmail(recipient, subject, "", options);
      return { success: true, fromUsed: fromUsed };
    } catch (gErr) {
      // Fallback to MailApp if GmailApp requires extra interactive consent
      try {
        MailApp.sendEmail({
          to: recipient,
          subject: subject,
          htmlBody: htmlBody,
          name: "Eye Of Ru Enterprises",
          replyTo: customerEmail || recipient
        });
        return { success: true, fromUsed: "MailApp" };
      } catch (mErr) {
        console.warn("Mail dispatch error:", mErr);
        return { success: false, error: mErr.toString(), gmailError: gErr.toString(), recipient: recipient };
      }
    }
  } catch (err) {
    console.warn("sendAgencyEmail general exception:", err);
    return { success: false, error: err.toString(), recipient: recipient };
  }
}

/**
 * Retrieves or creates client operational spreadsheet
 */
function getOrCreateClientSheet(clientFolders, clientName) {
  var sheetName = clientName + " — Operational Data & Leads";
  var files = clientFolders.data.getFilesByName(sheetName);
  var ss;

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(sheetName);
    var file = DriveApp.getFileById(ss.getId());
    clientFolders.data.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    var leadsSheet = ss.getActiveSheet();
    leadsSheet.setName("Leads");
    leadsSheet.appendRow(["Timestamp", "Full Name", "Email", "Phone", "Subject", "Message", "Status", "Turnstile Verified"]);
    leadsSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#0d0f12").setFontColor("#e5be7d");
  }

  // Ensure Staging_Queue tab is provisioned with 10 columns
  var queueSheet = ss.getSheetByName("Staging_Queue");
  if (!queueSheet) {
    queueSheet = ss.insertSheet("Staging_Queue");
    queueSheet.appendRow(["Timestamp", "Client Name", "Target Section", "Field", "Current Value", "Proposed Value", "Status", "Client Rationale", "Submitted By", "Operator Notes"]);
    queueSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#0d0f12").setFontColor("#e5be7d");
  }

  return { ss: ss };
}

/**
 * Risk evaluation heuristics for concierge update requests
 */
function evaluateUpdateRisk(targetSection, field, currentValue, proposedValue, clientRationale) {
  var combined = ((targetSection || "") + " " + (field || "") + " " + (proposedValue || "") + " " + (clientRationale || "")).toLowerCase();
  
  var pricingRegex = /(\$|\bprice\b|\brate\b|\bcost\b|\bfee\b|\bretainer\b|\bpricing\b|\bhourly\b)/i;
  var contactRegex = /(\bphone\b|\bemail\b|\bcall\b|\bcontact\b|\baddress\b|\bdns\b|\bdomain\b)/i;
  var hoursSevereRegex = /(\bclosed indefinitely\b|\bcut hours\b|\bshutdown\b|\bemergency closure\b)/i;
  var legalRegex = /(\bterms\b|\bprivacy\b|\bliability\b|\bdisclaimer\b|\blegal\b)/i;
  var structuralRegex = /(\bdelete\b|\bremove\b|\bpurge\b|\bdrop\b)/i;

  var reasons = [];
  if (pricingRegex.test(combined)) reasons.push("Pricing / Financial Rate modification detected");
  if (contactRegex.test(combined)) reasons.push("Critical contact routing or inquiry endpoint change detected");
  if (hoursSevereRegex.test(combined)) reasons.push("Severe schedule reduction or closure detected");
  if (legalRegex.test(combined)) reasons.push("Legal disclaimer or governance policy change detected");
  if (structuralRegex.test(combined)) reasons.push("Structural deletion directive detected");
  if ((proposedValue || "").length > 600) reasons.push("Large-scale code/content volume replacement (>600 chars)");

  return {
    isHighRisk: reasons.length > 0,
    reasons: reasons,
    recommendedStatus: reasons.length > 0 ? "REQUIRES_2STEP" : "PENDING_REVIEW"
  };
}

/**
 * Formats and dispatches high-priority HTML email notification to agency@
 */
function sendStagingAlertEmail(clientName, targetSection, field, currentValue, proposedValue, clientRationale, submittedBy, status, riskEval, spreadsheetUrl, brandFolderUrl) {
  var is2Step = (status === "REQUIRES_2STEP");
  var combinedText = ((targetSection || "") + " " + (field || "") + " " + (proposedValue || "") + " " + (clientRationale || "")).toLowerCase();
  var isExpedited = (status === "EXPEDITED" || status === "EXPEDITED_SLA" || combinedText.indexOf("tomorrow") > -1 || combinedText.indexOf("urgent") > -1 || combinedText.indexOf("asap") > -1 || combinedText.indexOf("expedited") > -1);

  var subjectPrefix = isExpedited ? "🔥 [EXPEDITED 24H SLA] " : (is2Step ? "🚨 [ACTION REQUIRED: 2-STEP CLIENT CALL] " : "[STAGING APPROVAL REQUIRED] ");
  var subject = subjectPrefix + clientName + " — " + targetSection + " (" + field + ")";

  var statusBadgeColor = is2Step ? "#f43f5e" : (isExpedited ? "#f97316" : "#f59e0b");
  var statusBadgeBg = is2Step ? "#4c0519" : (isExpedited ? "#431407" : "#451a03");
  var statusDisplay = isExpedited ? "🔥 EXPEDITED 24H SLA" : status;

  var alertBanner = "";
  if (isExpedited) {
    alertBanner += 
      "<div style='background:#381207;border:1px solid #f97316;border-radius:8px;padding:14px;margin-bottom:16px;color:#fed7aa;'>" +
        "<strong style='color:#f97316;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;'>🔥 Expedited 24-Hour SLA Detected (Target: By Tomorrow)</strong>" +
        "<p style='margin:4px 0 8px 0;font-size:12px;line-height:1.4;'>The client has specified a critical 24-hour turnaround deadline for this modification (e.g. Service photo replacements). Brand assets and raw files are routed to the client Google Drive folder: <strong>02_Brand Assets & Media</strong>.</p>" +
        (brandFolderUrl ? "<div style='margin-top:8px;'><a href='" + brandFolderUrl + "' style='background:#f97316;color:#0d0f12;text-decoration:none;font-weight:bold;font-size:11px;padding:6px 12px;border-radius:4px;display:inline-block;'>📁 Access 02_Brand Assets & Media Folder ↗</a></div>" : "") +
      "</div>";
  }

  if (is2Step) {
    var reasonsList = (riskEval && riskEval.reasons && riskEval.reasons.length > 0) 
      ? riskEval.reasons.map(function(r) { return "• " + r; }).join("<br>")
      : "• High-impact change flagged for mandatory verbal authorization";

    alertBanner += 
      "<div style='background:#2a0a14;border:1px solid #f43f5e;border-radius:8px;padding:14px;margin-bottom:18px;color:#fecdd3;'>" +
        "<div style='display:flex;align-items:center;margin-bottom:6px;'>" +
          "<strong style='color:#f43f5e;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;'>⚠️ 2-Step Verification Required Prior to Deployment</strong>" +
        "</div>" +
        "<p style='margin:4px 0 8px 0;font-size:12px;line-height:1.4;'>This modification has been flagged as high-impact or sensitive. Protocol requires an agency representative to contact the client by verified phone to verbally confirm intent before pushing to production.</p>" +
        "<div style='font-size:11px;color:#fda4af;background:#1a050c;padding:8px;border-radius:4px;'>" +
          "<strong>Detected Triggers:</strong><br>" + reasonsList +
        "</div>" +
      "</div>";
  }

  var html = 
    "<div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;max-width:640px;margin:auto;padding:24px;background:#0d0f12;color:#f1f5f9;border-radius:12px;border:1px solid #c89b4e;'>" +
      "<div style='border-bottom:1px solid #232b38;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;'>" +
        "<div>" +
          "<span style='color:#c89b4e;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;display:block;'>Eye Of Ru Enterprises · AI Concierge</span>" +
          "<span style='color:#94a3b8;font-size:11px;'>Air-Gapped Client Staging Queue</span>" +
        "</div>" +
        "<span style='background:" + statusBadgeBg + ";color:" + statusBadgeColor + ";border:1px solid " + statusBadgeColor + ";font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;font-family:monospace;'>" + statusDisplay + "</span>" +
      "</div>" +
      alertBanner +

      "<h2 style='color:#f8fafc;font-size:18px;margin:0 0 10px 0;'>Staging Proposal Awaiting Review</h2>" +
      "<div style='background:#141820;padding:12px;border-radius:8px;margin-bottom:16px;font-size:12px;color:#94a3b8;'>" +
        "<p style='margin:4px 0;'><strong>Client:</strong> <span style='color:#f1f5f9;'>" + clientName + "</span></p>" +
        "<p style='margin:4px 0;'><strong>Target Component:</strong> <span style='color:#c89b4e;'>" + targetSection + " › " + field + "</span></p>" +
        "<p style='margin:4px 0;'><strong>Submitted By:</strong> <span style='color:#cbd5e1;'>" + (submittedBy || "Authorized Client") + "</span></p>" +
        "<p style='margin:4px 0;'><strong>Timestamp:</strong> <span style='color:#cbd5e1;'>" + Utilities.formatDate(new Date(), "America/New_York", "yyyy-MM-dd HH:mm:ss") + " EST</span></p>" +
      "</div>" +

      "<div style='margin-bottom:16px;'>" +
        "<div style='font-size:11px;font-weight:bold;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;font-family:monospace;'>Side-by-Side Live Diff:</div>" +
        "<table style='width:100%;border-collapse:collapse;font-size:11px;font-family:monospace;border-radius:8px;overflow:hidden;border:1px solid #232b38;'>" +
          "<thead>" +
            "<tr style='background:#1a202c;color:#cbd5e1;'>" +
              "<th style='padding:8px 10px;text-align:left;width:50%;border-right:1px solid #232b38;'>Current Baseline</th>" +
              "<th style='padding:8px 10px;text-align:left;width:50;'>Proposed Value</th>" +
            "</tr>" +
          "</thead>" +
          "<tbody>" +
            "<tr>" +
              "<td style='padding:12px;background:#1a0e10;color:#fca5a5;border-right:1px solid #232b38;vertical-align:top;white-space:pre-wrap;'>" + escapeHtml(currentValue) + "</td>" +
              "<td style='padding:12px;background:#0b1a13;color:#86efac;vertical-align:top;white-space:pre-wrap;'>" + escapeHtml(proposedValue) + "</td>" +
            "</tr>" +
          "</tbody>" +
        "</table>" +
      "</div>" +

      "<div style='background:#141820;padding:12px;border-radius:8px;border-left:3px solid #c89b4e;margin-bottom:20px;font-size:12px;color:#cbd5e1;'>" +
        "<strong style='color:#e2e8f0;font-size:11px;text-transform:uppercase;display:block;margin-bottom:4px;'>Client Direction / Prompt Rationale:</strong>" +
        "<blockquote style='margin:0;padding:0;font-style:italic;color:#e2e8f0;'>" + escapeHtml(clientRationale || "No explicit rationale provided") + "</blockquote>" +
      "</div>" +

      "<div style='margin-top:20px;padding-top:16px;border-top:1px solid #232b38;display:flex;gap:12px;flex-wrap:wrap;'>" +
        "<a href='" + spreadsheetUrl + "' style='background:#c89b4e;color:#0d0f12;text-decoration:none;font-weight:bold;font-size:12px;padding:10px 16px;border-radius:6px;display:inline-block;'>Open Staging Queue Sheet ↗</a>" +
        (brandFolderUrl ? "<a href='" + brandFolderUrl + "' style='background:#232b38;color:#f97316;border:1px solid #f97316;text-decoration:none;font-weight:bold;font-size:12px;padding:10px 16px;border-radius:6px;display:inline-block;'>Browse Client Brand Assets (02_Brand Assets & Media) ↗</a>" : "") +
      "</div>" +

      "<div style='margin-top:16px;font-size:11px;color:#64748b;font-family:monospace;'>" +
        "Antigravity Intake: Run <code style='color:#c89b4e;'>.\\scripts\\Sync-StagingQueue.ps1</code> in workspace terminal." +
      "</div>" +
    "</div>";

  var recipients = "agency@eyeofruenterprisesllc.com, jeremy@eyeofruenterprisesllc.com, eyeofru1@gmail.com";
  return sendAgencyEmail(recipients, submittedBy, subject, html);
}

/**
 * Developer helper: Run this once in the Google Apps Script Web Editor (dropdown -> authorizeMailPermissions -> Run)
 * to grant GmailApp & MailApp authorization for the web app deployment.
 */
function authorizeMailPermissions() {
  var testEmail = Session.getActiveUser().getEmail() || "agency@eyeofruenterprisesllc.com";
  Logger.log("Authorizing script permissions for: " + testEmail);
  try {
    var aliases = GmailApp.getAliases();
    Logger.log("Detected Gmail Aliases: " + JSON.stringify(aliases));
  } catch (err) {
    Logger.log("GmailApp.getAliases notice: " + err);
  }

  var result = sendAgencyEmail(
    testEmail,
    testEmail,
    "Eye Of Ru Enterprises — Webhook Email Permissions Verified",
    "<div style='font-family:sans-serif;padding:20px;background:#0d0f12;color:#f8fafc;border-radius:8px;border:1px solid #c89b4e;'>" +
      "<h2 style='color:#c89b4e;margin-top:0;'>Eye Of Ru Enterprises</h2>" +
      "<p>Google Apps Script mail permissions (GmailApp + MailApp) are successfully verified and active for the deployed Web App.</p>" +
      "<p>Timestamp: " + new Date().toString() + "</p>" +
    "</div>"
  );
  Logger.log("Email Dispatch Result: " + JSON.stringify(result));
  return result;
}

/**
 * Dispatches confirmation email to client when update is deployed to production
 */
function sendClientDeploymentConfirmation(clientEmail, clientName, targetSection, field, proposedValue) {
  if (!clientEmail || clientEmail.indexOf("@") === -1) return { success: false, reason: "No valid client email" };
  var subject = "✓ [UPDATE DEPLOYED] " + clientName + " — " + targetSection + " is Live";
  var html = 
    "<div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;max-width:600px;margin:auto;padding:24px;background:#0d0f12;color:#f1f5f9;border-radius:12px;border:1px solid #10b981;'>" +
      "<div style='border-bottom:1px solid #232b38;padding-bottom:12px;margin-bottom:16px;'>" +
        "<span style='color:#10b981;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;'>Eye Of Ru Enterprises · Studio Notice</span>" +
      "</div>" +
      "<h2 style='color:#f8fafc;font-size:18px;margin:0 0 10px 0;'>Your Staged Update Has Been Approved & Deployed</h2>" +
      "<p style='color:#94a3b8;font-size:13px;line-height:1.5;'>We are pleased to inform you that your requested adjustment to <strong>" + targetSection + " (" + field + ")</strong> has been verified by our engineering team and deployed to production on Cloudflare Pages.</p>" +
      "<div style='background:#0b1a13;border:1px solid rgba(16,185,129,0.3);padding:14px;border-radius:8px;margin:16px 0;font-family:monospace;font-size:12px;color:#86efac;white-space:pre-wrap;'>" +
        escapeHtml(proposedValue) +
      "</div>" +
      "<p style='color:#64748b;font-size:12px;'>You can view the live changes on your website or check your private dashboard at /concierge.</p>" +
    "</div>";

  return sendAgencyEmail(clientEmail, "agency@eyeofruenterprisesllc.com", subject, html);
}

/**
 * Detects and validates binary image format from raw Apps Script byte array.
 * Converts Java signed bytes (-128..127) to unsigned (0..255).
 * Returns { format: string, mimeType: string, extension: string } or null.
 */
function inspectImageBinaryHeader(bytes) {
  if (!bytes || bytes.length < 12) {
    return null;
  }

  function u8(index) {
    var b = bytes[index];
    return b < 0 ? b + 256 : b;
  }

  // 1. JPEG: FF D8 FF
  if (u8(0) === 0xFF && u8(1) === 0xD8 && u8(2) === 0xFF) {
    return { format: "JPEG", mimeType: "image/jpeg", extension: "jpg" };
  }

  // 2. PNG: 89 50 4E 47
  if (u8(0) === 0x89 && u8(1) === 0x50 && u8(2) === 0x4E && u8(3) === 0x47) {
    return { format: "PNG", mimeType: "image/png", extension: "png" };
  }

  // 3. GIF: GIF8 (0x47, 0x49, 0x46, 0x38)
  if (u8(0) === 0x47 && u8(1) === 0x49 && u8(2) === 0x46 && u8(3) === 0x38) {
    return { format: "GIF", mimeType: "image/gif", extension: "gif" };
  }

  // 4. WebP: RIFF at 0..3 and WEBP at 8..11
  if (u8(0) === 0x52 && u8(1) === 0x49 && u8(2) === 0x46 && u8(3) === 0x46 &&
      u8(8) === 0x57 && u8(9) === 0x45 && u8(10) === 0x42 && u8(11) === 0x50) {
    return { format: "WEBP", mimeType: "image/webp", extension: "webp" };
  }

  // 5. AVIF: 'ftyp' at 4..7 and 'avif' / 'avis' at 8..11
  if (u8(4) === 0x66 && u8(5) === 0x74 && u8(6) === 0x79 && u8(7) === 0x70) {
    var brand = String.fromCharCode(u8(8), u8(9), u8(10), u8(11));
    if (brand === "avif" || brand === "avis") {
      return { format: "AVIF", mimeType: "image/avif", extension: "avif" };
    }
  }

  return null;
}

/**
 * Sanitizes asset file name:
 * - Neutralizes directory traversal (../, ..\)
 * - Strips null bytes and control chars
 * - Eliminates multi-extension masking
 * - Enforces extension matching detected binary signature
 */
function sanitizeAssetFileName(originalName, detectedExtension) {
  var name = (originalName || "").toString();
  name = name.replace(/[\0\x00-\x1f\x7f]/g, "");
  name = name.replace(/[\/\\]/g, "_").replace(/\.\.+/g, "");
  var baseName = name.replace(/\.[^.]+$/, "");
  baseName = baseName.replace(/[^a-zA-Z0-9_\-]/g, "_").replace(/^_+|_+$/g, "").replace(/_+/g, "_");
  if (!baseName) {
    baseName = "Asset_" + new Date().getTime();
  }
  return baseName + "." + (detectedExtension || "jpg");
}

/**
 * Route 13 / Helper: Clean & Archive Aged Records (>30 Days Closed / Deployed / Rejected)
 * Uses two-phase commit and descending-order row deletion to guarantee zero data loss.
 */
function archiveOldRecords(clientFolders, clientName) {
  var sheetData = getOrCreateClientSheet(clientFolders, clientName);
  var ss = sheetData.ss;
  var cutoff = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
  var archivedLeadsCount = 0;
  var archivedStagingCount = 0;

  // 1. Archive Leads marked 'Closed' older than 30 days
  var leadsSheet = ss.getSheetByName("Leads");
  if (leadsSheet) {
    var leadValues = leadsSheet.getDataRange().getValues();
    var leadsToArchive = [];
    var leadIndicesToDelete = [];

    for (var l = 1; l < leadValues.length; l++) {
      var lRow = leadValues[l];
      var lDate = lRow[0] instanceof Date ? lRow[0] : (lRow[0] ? new Date(lRow[0]) : null);
      var lStatus = (lRow[6] || "").toString().trim().toLowerCase();

      if (lDate && !isNaN(lDate.getTime()) && lDate < cutoff && lStatus === "closed") {
        leadsToArchive.push(lRow);
        leadIndicesToDelete.push(l + 1);
      }
    }

    if (leadsToArchive.length > 0) {
      var archiveLeadsSheet = ss.getSheetByName("Archive_Leads");
      if (!archiveLeadsSheet) {
        archiveLeadsSheet = ss.insertSheet("Archive_Leads");
        archiveLeadsSheet.appendRow(["Timestamp", "Full Name", "Email", "Phone", "Subject", "Message", "Status", "Turnstile Verified"]);
        archiveLeadsSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#0d0f12").setFontColor("#e5be7d");
      }
      archiveLeadsSheet.getRange(archiveLeadsSheet.getLastRow() + 1, 1, leadsToArchive.length, leadsToArchive[0].length).setValues(leadsToArchive);
      SpreadsheetApp.flush();

      for (var ld = leadIndicesToDelete.length - 1; ld >= 0; ld--) {
        leadsSheet.deleteRow(leadIndicesToDelete[ld]);
      }
      SpreadsheetApp.flush();
      archivedLeadsCount = leadsToArchive.length;
    }
  }

  // 2. Archive Staging Queue records marked 'DEPLOYED' or 'REJECTED' older than 30 days
  var queueSheet = ss.getSheetByName("Staging_Queue");
  if (queueSheet) {
    var queueValues = queueSheet.getDataRange().getValues();
    var stagingToArchive = [];
    var stagingIndicesToDelete = [];

    for (var q = 1; q < queueValues.length; q++) {
      var qRow = queueValues[q];
      var qDate = qRow[0] instanceof Date ? qRow[0] : (qRow[0] ? new Date(qRow[0]) : null);
      var qStatus = (qRow[6] || "").toString().trim().toUpperCase();

      if (qDate && !isNaN(qDate.getTime()) && qDate < cutoff && (qStatus === "DEPLOYED" || qStatus === "REJECTED")) {
        stagingToArchive.push(qRow);
        stagingIndicesToDelete.push(q + 1);
      }
    }

    if (stagingToArchive.length > 0) {
      var archiveStagingSheet = ss.getSheetByName("Archive_Staging");
      if (!archiveStagingSheet) {
        archiveStagingSheet = ss.insertSheet("Archive_Staging");
        archiveStagingSheet.appendRow(["Timestamp", "Client Name", "Target Section", "Field", "Current Value", "Proposed Value", "Status", "Client Rationale", "Submitted By", "Operator Notes"]);
        archiveStagingSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#0d0f12").setFontColor("#e5be7d");
      }
      archiveStagingSheet.getRange(archiveStagingSheet.getLastRow() + 1, 1, stagingToArchive.length, stagingToArchive[0].length).setValues(stagingToArchive);
      SpreadsheetApp.flush();

      for (var qd = stagingIndicesToDelete.length - 1; qd >= 0; qd--) {
        queueSheet.deleteRow(stagingIndicesToDelete[qd]);
      }
      SpreadsheetApp.flush();
      archivedStagingCount = stagingToArchive.length;
    }
  }

  return {
    status: "SUCCESS",
    action: "ARCHIVE_OLD_RECORDS",
    clientName: clientName,
    archivedLeadsCount: archivedLeadsCount,
    archivedStagingCount: archivedStagingCount,
    cutoffDate: cutoff.toISOString()
  };
}

/**
 * Helper to fetch rows from Staging_Queue (with optional archived rows and limit)
 */
function getStagingQueueItems(clientFolders, clientName, includeArchived, limit) {
  includeArchived = (includeArchived === true || includeArchived === "true");
  limit = parseInt(limit, 10);
  if (isNaN(limit) || limit <= 0) limit = 100;
  if (limit > 500) limit = 500;

  var sheetData = getOrCreateClientSheet(clientFolders, clientName);
  var queueSheet = sheetData.ss.getSheetByName("Staging_Queue");
  var items = [];

  if (queueSheet) {
    var values = queueSheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0] && !row[2]) continue;
      items.push({
        rowIndex: i + 1,
        timestamp: row[0],
        clientName: row[1] || clientName,
        targetSection: row[2] || "",
        field: row[3] || "",
        currentValue: row[4] || "",
        proposedValue: row[5] || "",
        status: row[6] || "PENDING_REVIEW",
        clientRationale: row[7] || "",
        submittedBy: row[8] || "",
        operatorNotes: row[9] || "",
        isArchived: false
      });
    }
  }

  if (includeArchived) {
    var archiveSheet = sheetData.ss.getSheetByName("Archive_Staging");
    if (archiveSheet) {
      var aValues = archiveSheet.getDataRange().getValues();
      for (var a = 1; a < aValues.length; a++) {
        var aRow = aValues[a];
        if (!aRow[0] && !aRow[2]) continue;
        items.push({
          rowIndex: -(a + 1),
          timestamp: aRow[0],
          clientName: aRow[1] || clientName,
          targetSection: aRow[2] || "",
          field: aRow[3] || "",
          currentValue: aRow[4] || "",
          proposedValue: aRow[5] || "",
          status: aRow[6] || "DEPLOYED",
          clientRationale: aRow[7] || "",
          submittedBy: aRow[8] || "",
          operatorNotes: aRow[9] || "",
          isArchived: true
        });
      }
    }
  }

  if (items.length > limit) {
    items = items.slice(items.length - limit);
  }
  return items;
}

/**
 * Helper to fetch rows from Leads sheet (with optional archived rows and limit)
 */
function getLeadItems(clientFolders, clientName, includeArchived, limit) {
  includeArchived = (includeArchived === true || includeArchived === "true");
  limit = parseInt(limit, 10);
  if (isNaN(limit) || limit <= 0) limit = 100;
  if (limit > 500) limit = 500;

  var sheetData = getOrCreateClientSheet(clientFolders, clientName);
  var leadsSheet = sheetData.ss.getSheetByName("Leads") || sheetData.ss.getSheets()[0];
  var leads = [];

  if (leadsSheet) {
    var values = leadsSheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0] && !row[1] && !row[2]) continue;

      leads.push({
        rowIndex: i + 1,
        timestamp: row[0],
        fullName: row[1] || "",
        email: row[2] || "",
        phone: row[3] || "",
        subject: row[4] || "",
        message: row[5] || "",
        status: row[6] || "New Lead",
        turnstile: row[7] || "",
        isArchived: false
      });
    }
  }

  if (includeArchived) {
    var archiveLeads = sheetData.ss.getSheetByName("Archive_Leads");
    if (archiveLeads) {
      var alValues = archiveLeads.getDataRange().getValues();
      for (var al = 1; al < alValues.length; al++) {
        var alRow = alValues[al];
        if (!alRow[0] && !alRow[1] && !alRow[2]) continue;

        leads.push({
          rowIndex: -(al + 1),
          timestamp: alRow[0],
          fullName: alRow[1] || "",
          email: alRow[2] || "",
          phone: alRow[3] || "",
          subject: alRow[4] || "",
          message: alRow[5] || "",
          status: alRow[6] || "Closed",
          turnstile: alRow[7] || "",
          isArchived: true
        });
      }
    }
  }

  if (leads.length > limit) {
    leads = leads.slice(leads.length - limit);
  }
  return leads;
}

function escapeHtml(text) {
  if (!text) return "";
  return text.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Returns the client-specific isolated folder tree
 */
function getClientFolderTree(clientName) {
  var root = getOrCreateFolder(DriveApp.getRootFolder(), "Eye Of Ru Enterprises");
  var clientsParent = getOrCreateFolder(root, "Clients");
  var clientRoot = getOrCreateFolder(clientsParent, clientName);

  return {
    clientRoot: clientRoot,
    audits: getOrCreateFolder(clientRoot, "01_Audits & Proposals"),
    brand: getOrCreateFolder(clientRoot, "02_Brand Assets & Media"),
    data: getOrCreateFolder(clientRoot, "03_Data & Lead Sheets"),
    handoff: getOrCreateFolder(clientRoot, "04_Production Handoff")
  };
}

function getOrCreateFolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(name);
}

function sanitizeName(name) {
  return name.replace(/[\/\\:*?"<>|]/g, "_").trim();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var aliases = [];
  try { aliases = GmailApp.getAliases(); } catch (err) {}

  if (e && e.parameter && e.parameter.action === "GET_STAGING_QUEUE") {
    var clientName = sanitizeName(e.parameter.clientName || "General Client");
    var clientFolders = getClientFolderTree(clientName);
    var queueItems = getStagingQueueItems(clientFolders, clientName, e.parameter.includeArchived, e.parameter.limit);
    return jsonResponse({
      status: "SUCCESS",
      action: "GET_STAGING_QUEUE",
      clientName: clientName,
      count: queueItems.length,
      items: queueItems
    });
  }

  if (e && e.parameter && e.parameter.action === "GET_LEADS") {
    var clientName = sanitizeName(e.parameter.clientName || "General Client");
    var clientFolders = getClientFolderTree(clientName);
    var leadItems = getLeadItems(clientFolders, clientName, e.parameter.includeArchived, e.parameter.limit);
    return jsonResponse({
      status: "SUCCESS",
      action: "GET_LEADS",
      clientName: clientName,
      count: leadItems.length,
      leads: leadItems
    });
  }

  if (e && e.parameter && e.parameter.action === "ARCHIVE_OLD_RECORDS") {
    var clientName = sanitizeName(e.parameter.clientName || "General Client");
    var clientFolders = getClientFolderTree(clientName);
    var archiveResult = archiveOldRecords(clientFolders, clientName);
    return jsonResponse(archiveResult);
  }

  var statusInfo = {
    status: "ACTIVE",
    version: "1.4.0",
    service: "Eye Of Ru Ingestion & Leads Webhook",
    activeUser: Session.getActiveUser().getEmail(),
    availableAliases: aliases,
    supportsAgencyAlias: (aliases.indexOf("agency@eyeofruenterprisesllc.com") > -1)
  };
  return jsonResponse(statusInfo);
}

