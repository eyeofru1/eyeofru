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
      var toEmail = data.toEmail || Session.getActiveUser().getEmail();
      var testSubject = "Eye Of Ru Test Transmission from agency@";
      var testHtml = "<div style='font-family:sans-serif;padding:20px;background:#0d0f12;color:#f8fafc;border-radius:8px;'>" +
        "<h2 style='color:#c89b4e;margin-top:0;'>Eye Of Ru Enterprises</h2>" +
        "<p>This is a verified test email sent via Google Apps Script.</p>" +
        "<p><strong>Configured Sender Alias:</strong> agency@eyeofruenterprisesllc.com</p>" +
        "<p><strong>Timestamp:</strong> " + new Date().toString() + "</p>" +
        "</div>";

      var emailResult = sendAgencyEmail(toEmail, toEmail, testSubject, testHtml);

      return jsonResponse({
        status: "SUCCESS",
        action: "TEST_EMAIL",
        sentTo: toEmail,
        senderUsed: emailResult.fromUsed,
        availableAliases: GmailApp.getAliases()
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

    // Route 5: Upload Brand Assets / Media
    else if (action === "UPLOAD_ASSET") {
      var assetName = data.fileName || "Asset_" + new Date().getTime();
      var mimeType = data.mimeType || "image/jpeg";
      var assetBytes = Utilities.base64Decode(data.base64Data);
      var assetBlob = Utilities.newBlob(assetBytes, mimeType, assetName);

      var assetFile = clientFolders.brand.createFile(assetBlob);
      assetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return jsonResponse({
        status: "SUCCESS",
        action: "UPLOAD_ASSET",
        fileName: assetName,
        fileUrl: assetFile.getUrl()
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

    return jsonResponse({ status: "ERROR", message: "Unknown action: " + action });

  } catch (err) {
    return jsonResponse({ status: "ERROR", message: err.toString() });
  }
}

/**
 * Sends email using GmailApp forcing agency@eyeofruenterprisesllc.com alias
 */
function sendAgencyEmail(recipient, customerEmail, subject, htmlBody) {
  var targetAlias = "agency@eyeofruenterprisesllc.com";
  var options = {
    name: "Eye Of Ru Enterprises",
    replyTo: customerEmail || targetAlias,
    htmlBody: htmlBody
  };

  var aliases = GmailApp.getAliases();
  var fromUsed = Session.getActiveUser().getEmail();

  if (aliases && aliases.indexOf(targetAlias) > -1) {
    options.from = targetAlias;
    fromUsed = targetAlias;
  } else if (aliases && aliases.length > 0) {
    options.from = aliases[0];
    fromUsed = aliases[0];
  }

  GmailApp.sendEmail(recipient, subject, "", options);
  return { success: true, fromUsed: fromUsed };
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

    var queueSheet = ss.insertSheet("Staging_Queue");
    queueSheet.appendRow(["Timestamp", "Target Section", "Field", "Current Value", "Proposed Value", "Status", "Client Notes"]);
    queueSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#0d0f12").setFontColor("#e5be7d");
  }

  return { ss: ss };
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
  
  var statusInfo = {
    status: "ACTIVE",
    version: "1.1.0",
    service: "Eye Of Ru Ingestion & Leads Webhook",
    activeUser: Session.getActiveUser().getEmail(),
    availableAliases: aliases,
    supportsAgencyAlias: (aliases.indexOf("agency@eyeofruenterprisesllc.com") > -1)
  };
  return jsonResponse(statusInfo);
}
