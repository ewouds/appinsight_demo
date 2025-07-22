/**
 * Application Insights PoC - Client-Side Analytics Implementation
 *
 * This file demonstrates comprehensive web analytics tracking using
 * Azure Application Insights JavaScript SDK v3.0.
 *
 * Features:
 * - Complete purchase journey tracking
 * - A/B testing framework with variant assignment
 * - Cohort analysis and user retention metrics
 * - Device and browser analytics
 * - Performance monitoring and error tracking
 * - Session and user context management
 *
 * Compatible with: Application Insights JavaScript SDK v3.0+
 * Browser Support: Modern browsers (ES6+)
 */

class AnalyticsManager {
  constructor() {
    try {
      this.sessionId = this.generateSessionId();
      this.userId = this.getOrCreateUserId();
      this.pageViewCount = 0;
      this.sessionStartTime = Date.now();
      this.currentQuoteId = null;
      this.currentApplicationId = null;

      // Counters for metrics
      this.metrics = {
        pageViews: 0,
        quoteRequests: 0,
        applicationsStarted: 0,
        applicationsCompleted: 0,
        policiesSold: 0,
      };

      this.initializeTracking();
      this.startSessionTimer();

      console.log("✅ AnalyticsManager initialized successfully", {
        sessionId: this.sessionId,
        userId: this.userId,
        appInsightsAvailable: !!window.appInsights,
      });
    } catch (error) {
      console.error("❌ Error initializing AnalyticsManager:", error);
    }
  }

  generateSessionId() {
    return "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  getOrCreateUserId() {
    let userId = localStorage.getItem("app_insights_user_id");
    if (!userId) {
      userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("app_insights_user_id", userId);
    }
    return userId;
  }

  initializeTracking() {
    try {
      // Set user context using modern Application Insights v3 API
      if (window.appInsights) {
        console.log("🔧 Configuring Application Insights telemetry initializer...");

        // Modern way to set user context - use telemetry initializer
        appInsights.addTelemetryInitializer((envelope) => {
          // Set user context
          envelope.tags = envelope.tags || {};
          envelope.tags["ai.session.id"] = this.sessionId;
          envelope.tags["ai.user.id"] = this.userId;
          envelope.tags["ai.user.authUserId"] = this.userId;

          // Add custom properties
          if (!envelope.data) envelope.data = {};
          if (!envelope.data.baseData) envelope.data.baseData = {};
          if (!envelope.data.baseData.properties) envelope.data.baseData.properties = {};

          envelope.data.baseData.properties.userId = this.userId;
          envelope.data.baseData.properties.sessionId = this.sessionId;

          return true;
        });

        console.log("✅ Application Insights telemetry initializer configured");
      } else {
        console.warn("⚠️ Application Insights not available - tracking will be limited");
      }
    } catch (error) {
      console.error("❌ Error initializing tracking:", error);
    }

    // Track device and browser information
    this.trackDeviceInfo();
  }

  startSessionTimer() {
    // Update time on page every 5 seconds
    setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      document.getElementById("timeOnPage").textContent = timeOnPage + "s";
    }, 5000);
  }

  // Web Metrics Implementation
  trackPageView(pageName = "Home") {
    this.pageViewCount++;
    this.metrics.pageViews++;

    const pageViewData = {
      name: pageName,
      url: window.location.href,
      duration: Date.now() - this.sessionStartTime,
      isFirstView: this.pageViewCount === 1,
    };

    if (window.appInsights) {
      appInsights.trackPageView({
        name: pageName,
        uri: window.location.href,
        properties: {
          sessionId: this.sessionId,
          pageNumber: this.pageViewCount,
          isFirstView: pageViewData.isFirstView,
        },
        measurements: {
          timeOnPage: pageViewData.duration,
        },
      });
    }

    // Update UI
    document.getElementById("pageViews").textContent = this.metrics.pageViews;
    this.showStatus(`Page view tracked: ${pageName}`, "success");

    console.log("Page View Tracked:", pageViewData);
  }

  simulateNewVisitor() {
    // Clear existing user data to simulate new visitor
    localStorage.removeItem("app_insights_user_id");
    localStorage.removeItem("visitor_type");
    localStorage.setItem("visitor_type", "new");

    const eventData = {
      visitorType: "new",
      timestamp: new Date().toISOString(),
      source: "organic", // Simulated traffic source
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "NewVisitorAcquisition",
        properties: {
          visitorType: "new",
          trafficSource: "organic",
          sessionId: this.sessionId,
        },
      });
    }

    this.showStatus("New visitor simulation tracked", "success");
    console.log("New Visitor Simulated:", eventData);
  }

  simulateReturningVisitor() {
    localStorage.setItem("visitor_type", "returning");

    const lastVisit = localStorage.getItem("last_visit");
    const daysSinceLastVisit = lastVisit ? Math.floor((Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24)) : 0;

    const eventData = {
      visitorType: "returning",
      daysSinceLastVisit: daysSinceLastVisit,
      timestamp: new Date().toISOString(),
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "ReturningVisitorEngagement",
        properties: {
          visitorType: "returning",
          sessionId: this.sessionId,
        },
        measurements: {
          daysSinceLastVisit: daysSinceLastVisit,
        },
      });
    }

    localStorage.setItem("last_visit", Date.now().toString());
    this.showStatus(`Returning visitor tracked (${daysSinceLastVisit} days since last visit)`, "success");
    console.log("Returning Visitor Simulated:", eventData);
  }

  simulateBounce() {
    const bounceData = {
      timeOnPage: Date.now() - this.sessionStartTime,
      pageViews: this.pageViewCount,
      exitReason: "immediate_exit",
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "BounceEvent",
        properties: {
          exitReason: "immediate_exit",
          sessionId: this.sessionId,
        },
        measurements: {
          timeOnPageMs: bounceData.timeOnPage,
          pageViewsInSession: bounceData.pageViews,
        },
      });
    }

    this.showStatus("Bounce event tracked (user left immediately)", "error");
    console.log("Bounce Simulated:", bounceData);
  }

  trackTimeOnPage() {
    const timeOnPage = Date.now() - this.sessionStartTime;

    if (window.appInsights) {
      appInsights.trackMetric({
        name: "TimeOnPage",
        value: timeOnPage,
        properties: {
          sessionId: this.sessionId,
          pageName: "Home",
        },
      });
    }

    this.showStatus(`Time on page tracked: ${Math.floor(timeOnPage / 1000)} seconds`, "success");
    console.log("Time on Page:", timeOnPage);
  }

  // Purchase Journey Implementation
  submitQuoteRequest() {
    const customerName = document.getElementById("customerName").value;
    const insuranceType = document.getElementById("insuranceType").value;
    const coverageAmount = document.getElementById("coverageAmount").value;

    if (!customerName || !insuranceType || !coverageAmount) {
      this.showStatus("Please fill in all fields", "error");
      return;
    }

    this.currentQuoteId = "quote_" + Date.now();
    this.metrics.quoteRequests++;

    const quoteData = {
      quoteId: this.currentQuoteId,
      customerName,
      insuranceType,
      coverageAmount: parseFloat(coverageAmount),
      timestamp: new Date().toISOString(),
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "QuoteRequested",
        properties: {
          quoteId: this.currentQuoteId,
          insuranceType,
          sessionId: this.sessionId,
        },
        measurements: {
          coverageAmount: parseFloat(coverageAmount),
        },
      });
    }

    // Update UI
    document.getElementById("quoteRequests").textContent = this.metrics.quoteRequests;
    document.getElementById("applicationId").value = this.currentQuoteId;
    document.getElementById("startAppBtn").disabled = false;

    this.showStatus(`Quote request submitted: ${this.currentQuoteId}`, "success");
    console.log("Quote Request:", quoteData);
  }

  startApplication() {
    if (!this.currentQuoteId) {
      this.showStatus("Please request a quote first", "error");
      return;
    }

    this.currentApplicationId = "app_" + Date.now();
    this.metrics.applicationsStarted++;

    const applicationData = {
      applicationId: this.currentApplicationId,
      quoteId: this.currentQuoteId,
      step: "started",
      timestamp: new Date().toISOString(),
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "ApplicationStarted",
        properties: {
          applicationId: this.currentApplicationId,
          quoteId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
      });

      // Track funnel step
      appInsights.trackEvent({
        name: "FunnelStep",
        properties: {
          step: "application_started",
          funnelId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
      });
    }

    // Update UI
    document.getElementById("applicationsStarted").textContent = this.metrics.applicationsStarted;
    document.getElementById("completeAppBtn").disabled = false;

    this.showStatus("Application started successfully", "success");
    console.log("Application Started:", applicationData);
  }

  completeApplication() {
    if (!this.currentApplicationId) {
      this.showStatus("Please start an application first", "error");
      return;
    }

    const personalInfo = document.getElementById("personalInfo").value;
    if (!personalInfo) {
      this.showStatus("Please fill in personal information", "error");
      return;
    }

    this.metrics.applicationsCompleted++;

    const completionData = {
      applicationId: this.currentApplicationId,
      quoteId: this.currentQuoteId,
      step: "completed",
      timeToComplete: Date.now() - this.sessionStartTime,
      timestamp: new Date().toISOString(),
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "ApplicationCompleted",
        properties: {
          applicationId: this.currentApplicationId,
          quoteId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
        measurements: {
          timeToCompleteMs: completionData.timeToComplete,
        },
      });

      // Track funnel step
      appInsights.trackEvent({
        name: "FunnelStep",
        properties: {
          step: "application_completed",
          funnelId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
      });
    }

    // Update UI
    document.getElementById("applicationsCompleted").textContent = this.metrics.applicationsCompleted;
    document.getElementById("purchaseBtn").disabled = false;

    this.showStatus("Application completed successfully", "success");
    console.log("Application Completed:", completionData);
  }

  purchasePolicy() {
    if (!this.currentApplicationId) {
      this.showStatus("Please complete an application first", "error");
      return;
    }

    const policyId = "policy_" + Date.now();
    this.metrics.policiesSold++;

    const purchaseData = {
      policyId,
      applicationId: this.currentApplicationId,
      quoteId: this.currentQuoteId,
      timeToConvert: Date.now() - this.sessionStartTime,
      timestamp: new Date().toISOString(),
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "PolicyPurchased",
        properties: {
          policyId,
          applicationId: this.currentApplicationId,
          quoteId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
        measurements: {
          timeToConvertMs: purchaseData.timeToConvert,
        },
      });

      // Track conversion
      appInsights.trackEvent({
        name: "Conversion",
        properties: {
          conversionType: "policy_purchase",
          funnelId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
        measurements: {
          conversionValue: parseFloat(document.getElementById("coverageAmount").value) || 0,
        },
      });

      // Track funnel completion
      appInsights.trackEvent({
        name: "FunnelStep",
        properties: {
          step: "purchase_completed",
          funnelId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
      });
    }

    // Update UI
    document.getElementById("policiesSold").textContent = this.metrics.policiesSold;

    // Reset form
    this.resetPurchaseJourney();

    this.showStatus(`Policy purchased successfully: ${policyId}`, "success");
    console.log("Policy Purchased:", purchaseData);
  }

  resetPurchaseJourney() {
    this.currentQuoteId = null;
    this.currentApplicationId = null;
    document.getElementById("customerName").value = "";
    document.getElementById("insuranceType").value = "";
    document.getElementById("coverageAmount").value = "";
    document.getElementById("applicationId").value = "";
    document.getElementById("personalInfo").value = "";
    document.getElementById("startAppBtn").disabled = true;
    document.getElementById("completeAppBtn").disabled = true;
    document.getElementById("purchaseBtn").disabled = true;
  }

  // A/B Testing Implementation
  runABTest(variant) {
    const testData = {
      testName: "homepage_cta_test",
      variant,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "ABTestParticipation",
        properties: {
          testName: "homepage_cta_test",
          variant,
          sessionId: this.sessionId,
        },
      });
    }

    // Simulate different conversion rates
    const conversionRate = variant === "variant_a" ? 0.15 : 0.22;
    const converted = Math.random() < conversionRate;

    if (converted) {
      if (window.appInsights) {
        appInsights.trackEvent({
          name: "ABTestConversion",
          properties: {
            testName: "homepage_cta_test",
            variant,
            sessionId: this.sessionId,
          },
        });
      }
    }

    const resultDiv = document.getElementById("abTestResults");
    resultDiv.style.display = "block";
    resultDiv.className = converted ? "status success" : "status";
    resultDiv.textContent = `A/B Test ${variant.toUpperCase()}: ${converted ? "Converted!" : "No conversion"} (Simulated rate: ${(
      conversionRate * 100
    ).toFixed(1)}%)`;

    console.log("A/B Test:", testData, "Converted:", converted);
  }

  measurePageLoad() {
    // Simulate page load measurement
    const loadTime = Math.random() * 3000 + 500; // 500-3500ms

    if (window.appInsights) {
      appInsights.trackMetric({
        name: "PageLoadTime",
        value: loadTime,
        properties: {
          pageName: "Home",
          sessionId: this.sessionId,
        },
      });

      appInsights.trackPageViewPerformance({
        name: "HomePage",
        url: window.location.href,
        duration: loadTime,
        perfTotal: loadTime,
        networkConnect: loadTime * 0.1,
        sentRequest: loadTime * 0.2,
        receivedResponse: loadTime * 0.3,
        domProcessing: loadTime * 0.4,
      });
    }

    this.showStatus(`Page load time measured: ${loadTime.toFixed(0)}ms`, "success");
    console.log("Page Load Time:", loadTime);
  }

  simulateError() {
    const errorData = {
      errorType: "simulated_client_error",
      message: "This is a simulated error for demonstration purposes",
      timestamp: new Date().toISOString(),
    };

    if (window.appInsights) {
      appInsights.trackException({
        exception: new Error(errorData.message),
        properties: {
          errorType: errorData.errorType,
          sessionId: this.sessionId,
          isSimulated: true,
        },
      });
    }

    this.showStatus("Error simulation tracked in Application Insights", "error");
    console.error("Simulated Error:", errorData);
  }

  // Device & Segmentation Implementation
  trackDeviceInfo() {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "DeviceInfo",
        properties: {
          ...deviceInfo,
          sessionId: this.sessionId,
        },
      });
    }

    const deviceDiv = document.getElementById("deviceInfo");
    const detailsDiv = document.getElementById("deviceDetails");
    deviceDiv.style.display = "block";
    detailsDiv.innerHTML = `
            <strong>Platform:</strong> ${deviceInfo.platform}<br>
            <strong>Screen:</strong> ${deviceInfo.screenResolution}<br>
            <strong>Viewport:</strong> ${deviceInfo.viewport}<br>
            <strong>Language:</strong> ${deviceInfo.language}<br>
            <strong>Timezone:</strong> ${deviceInfo.timeZone}
        `;

    console.log("Device Info Tracked:", deviceInfo);
  }

  trackCustomSegment() {
    // Simulate custom segmentation based on user behavior
    const segments = ["high_value", "mobile_user", "enterprise", "small_business"];
    const randomSegment = segments[Math.floor(Math.random() * segments.length)];

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "UserSegmentation",
        properties: {
          segment: randomSegment,
          sessionId: this.sessionId,
          assignmentReason: "behavioral_analysis",
        },
      });
    }

    this.showStatus(`User assigned to segment: ${randomSegment}`, "success");
    console.log("Custom Segment Tracked:", randomSegment);
  }

  // Cohort Analysis Implementation
  joinCohort() {
    const cohortId = this.getCohortId();
    const joinDate = new Date().toISOString();

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "CohortJoin",
        properties: {
          cohortId,
          joinDate,
          sessionId: this.sessionId,
        },
      });
    }

    localStorage.setItem("user_cohort", cohortId);
    localStorage.setItem("cohort_join_date", joinDate);

    const cohortDiv = document.getElementById("cohortInfo");
    const detailsDiv = document.getElementById("cohortDetails");
    cohortDiv.style.display = "block";
    detailsDiv.innerHTML = `
            <strong>Cohort ID:</strong> ${cohortId}<br>
            <strong>Join Date:</strong> ${new Date(joinDate).toLocaleString()}<br>
            <strong>Status:</strong> Active Member
        `;

    this.showStatus(`Joined cohort: ${cohortId}`, "success");
    console.log("Cohort Join:", { cohortId, joinDate });
  }

  getCohortId() {
    // Generate cohort based on current month/year
    const now = new Date();
    return `cohort_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  trackRetention() {
    const cohortId = localStorage.getItem("user_cohort");
    const joinDate = localStorage.getItem("cohort_join_date");

    if (!cohortId || !joinDate) {
      this.showStatus("Please join a cohort first", "error");
      return;
    }

    const daysSinceJoin = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "CohortRetention",
        properties: {
          cohortId,
          sessionId: this.sessionId,
          retentionEvent: "active_engagement",
        },
        measurements: {
          daysSinceJoin,
        },
      });
    }

    this.showStatus(`Retention event tracked (Day ${daysSinceJoin} since joining cohort)`, "success");
    console.log("Retention Tracked:", { cohortId, daysSinceJoin });
  }

  viewCohortData() {
    const cohortId = localStorage.getItem("user_cohort");
    if (!cohortId) {
      this.showStatus("No cohort data available. Please join a cohort first.", "error");
      return;
    }

    // Simulate cohort analytics data
    const cohortData = {
      cohortId,
      totalMembers: Math.floor(Math.random() * 1000) + 100,
      activeMembers: Math.floor(Math.random() * 500) + 50,
      retentionRate: (Math.random() * 0.4 + 0.3).toFixed(2), // 30-70%
      avgSessionDuration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
    };

    if (window.appInsights) {
      appInsights.trackEvent({
        name: "CohortAnalysisView",
        properties: {
          cohortId: cohortData.cohortId,
          sessionId: this.sessionId,
        },
        measurements: {
          totalMembers: cohortData.totalMembers,
          activeMembers: cohortData.activeMembers,
          retentionRate: parseFloat(cohortData.retentionRate),
          avgSessionDuration: cohortData.avgSessionDuration,
        },
      });
    }

    const cohortDiv = document.getElementById("cohortInfo");
    const detailsDiv = document.getElementById("cohortDetails");
    cohortDiv.style.display = "block";
    detailsDiv.innerHTML = `
            <strong>Cohort ID:</strong> ${cohortData.cohortId}<br>
            <strong>Total Members:</strong> ${cohortData.totalMembers}<br>
            <strong>Active Members:</strong> ${cohortData.activeMembers}<br>
            <strong>Retention Rate:</strong> ${(cohortData.retentionRate * 100).toFixed(1)}%<br>
            <strong>Avg Session Duration:</strong> ${Math.floor(cohortData.avgSessionDuration / 60)}m ${cohortData.avgSessionDuration % 60}s
        `;

    this.showStatus("Cohort analytics data displayed", "success");
    console.log("Cohort Data:", cohortData);
  }

  // Utility Methods
  showStatus(message, type = "success") {
    const statusDiv = document.getElementById("statusDisplay");
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = "block";

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);
  }
}

// Global instance
let analyticsManager;

// Function to initialize analytics (called from HTML after App Insights is configured)
function initializeAnalytics() {
  try {
    analyticsManager = new AnalyticsManager();
    console.log("🎯 Analytics Manager initialized");

    // Track initial page view after a short delay
    setTimeout(() => {
      if (analyticsManager) {
        analyticsManager.trackPageView("HomePage");
      }
    }, 1000);

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Analytics Manager:", error);
    return false;
  }
}

// Legacy initialization for backwards compatibility
document.addEventListener("DOMContentLoaded", function () {
  // Only auto-initialize if not already done by HTML
  if (!analyticsManager && !window.appInsights) {
    console.log("🔄 Fallback: Initializing analytics without Application Insights");
    analyticsManager = new AnalyticsManager();
  }
});

// Global functions for HTML onclick handlers
function trackPageView() {
  analyticsManager.trackPageView();
}
function simulateNewVisitor() {
  analyticsManager.simulateNewVisitor();
}
function simulateReturningVisitor() {
  analyticsManager.simulateReturningVisitor();
}
function simulateBounce() {
  analyticsManager.simulateBounce();
}
function trackTimeOnPage() {
  analyticsManager.trackTimeOnPage();
}
function submitQuoteRequest() {
  analyticsManager.submitQuoteRequest();
}
function startApplication() {
  analyticsManager.startApplication();
}
function completeApplication() {
  analyticsManager.completeApplication();
}
function purchasePolicy() {
  analyticsManager.purchasePolicy();
}
function runABTest(variant) {
  analyticsManager.runABTest(variant);
}
function measurePageLoad() {
  analyticsManager.measurePageLoad();
}
function simulateError() {
  analyticsManager.simulateError();
}
function trackDeviceInfo() {
  analyticsManager.trackDeviceInfo();
}
function trackCustomSegment() {
  analyticsManager.trackCustomSegment();
}
function joinCohort() {
  analyticsManager.joinCohort();
}
function trackRetention() {
  analyticsManager.trackRetention();
}
function viewCohortData() {
  analyticsManager.viewCohortData();
}
