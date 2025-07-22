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

/**
 * AnalyticsManager - Comprehensive Web Analytics Implementation
 * 
 * This class provides a complete analytics solution for web applications using
 * Azure Application Insights. It demonstrates best practices for web analytics
 * including user tracking, conversion funnels, A/B testing, and cohort analysis.
 * 
 * Key Capabilities:
 * - User session and identity management with persistent tracking
 * - Purchase journey funnel analysis with conversion metrics
 * - A/B testing framework with statistical significance tracking
 * - Cohort analysis for user retention and lifecycle insights
 * - Device and browser analytics for segmentation
 * - Performance monitoring and error tracking
 * - Real-time metrics dashboard integration
 * 
 * Data Collection Strategy:
 * - Client-side events are enriched with server-side context
 * - User privacy is maintained through anonymized identifiers
 * - Session data persists across page reloads for accurate analytics
 * - Metrics are aggregated for real-time dashboard updates
 */
class AnalyticsManager {
  /**
   * Initializes the AnalyticsManager with comprehensive tracking setup
   * 
   * Sets up user identity, session management, and telemetry infrastructure.
   * Automatically begins tracking user behavior and device characteristics.
   * 
   * The constructor performs these critical initialization steps:
   * 1. Generates or retrieves persistent user and session identifiers
   * 2. Initializes metric counters for real-time dashboard updates
   * 3. Configures Application Insights telemetry pipeline
   * 4. Starts session timing for engagement analysis
   * 5. Collects device and browser information for segmentation
   */
  constructor() {
    try {
      // Generate unique identifiers for user and session tracking
      this.sessionId = this.generateSessionId();     // Unique per browser session
      this.userId = this.getOrCreateUserId();        // Persistent across sessions
      this.pageViewCount = 0;                        // Track pages viewed in current session
      this.sessionStartTime = Date.now();            // For calculating time-based metrics
      
      // Business process tracking - links events across the purchase funnel
      this.currentQuoteId = null;                    // Links quote to application to purchase
      this.currentApplicationId = null;              // Tracks application progress

      // Real-time metrics counters for dashboard display
      // These counters provide immediate feedback and demonstration value
      this.metrics = {
        pageViews: 0,                // Total page views in session
        quoteRequests: 0,            // Insurance quotes requested  
        applicationsStarted: 0,      // Applications begun
        applicationsCompleted: 0,    // Applications finished
        policiesSold: 0,             // Final conversions
      };

      // Initialize tracking infrastructure and begin data collection
      this.initializeTracking();                     // Configure Application Insights
      this.startSessionTimer();                      // Begin engagement timing

      console.log("✅ AnalyticsManager initialized successfully", {
        sessionId: this.sessionId,
        userId: this.userId,
        appInsightsAvailable: !!window.appInsights,
      });
    } catch (error) {
      console.error("❌ Error initializing AnalyticsManager:", error);
      // Graceful degradation - analytics failures shouldn't break the application
    }
  }

  /**
   * Generates a unique session identifier for tracking user sessions
   * 
   * The session ID combines timestamp and random string to ensure uniqueness
   * across different browser sessions and page loads.
   * 
   * @returns {string} Unique session ID in format "session_{timestamp}_{random}"
   */
  generateSessionId() {
    return "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Retrieves existing user ID from localStorage or creates a new one
   * 
   * This enables persistent user tracking across browser sessions.
   * The user ID is stored in localStorage and persists until the user
   * clears browser data or uses a different device/browser.
   * 
   * @returns {string} Persistent user ID in format "user_{timestamp}_{random}"
   */
  getOrCreateUserId() {
    let userId = localStorage.getItem("app_insights_user_id");
    if (!userId) {
      // Create new user ID if none exists
      userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("app_insights_user_id", userId);
    }
    return userId;
  }

  /**
   * Initializes Application Insights tracking configuration
   * 
   * This method sets up the telemetry initializer which automatically adds
   * custom properties to all telemetry data sent to Application Insights.
   * It ensures consistent user and session tracking across all events.
   * 
   * Key features:
   * - Sets up user and session context for all telemetry
   * - Adds custom properties to every telemetry item
   * - Configures device and browser information tracking
   * - Provides fallback behavior when Application Insights is not available
   */
  initializeTracking() {
    try {
      // Set user context using modern Application Insights v3 API
      if (window.appInsights) {
        console.log("🔧 Configuring Application Insights telemetry initializer...");

        // Modern way to set user context - use telemetry initializer
        // This function runs for every piece of telemetry sent to Application Insights
        appInsights.addTelemetryInitializer((envelope) => {
          // Set user context in Azure Application Insights standard fields
          envelope.tags = envelope.tags || {};
          envelope.tags["ai.session.id"] = this.sessionId;
          envelope.tags["ai.user.id"] = this.userId;
          envelope.tags["ai.user.authUserId"] = this.userId;

          // Add custom properties that will appear in all telemetry
          if (!envelope.data) envelope.data = {};
          if (!envelope.data.baseData) envelope.data.baseData = {};
          if (!envelope.data.baseData.properties) envelope.data.baseData.properties = {};

          // These properties will be available in Application Insights queries
          envelope.data.baseData.properties.userId = this.userId;
          envelope.data.baseData.properties.sessionId = this.sessionId;

          return true; // Continue processing the telemetry
        });

        console.log("✅ Application Insights telemetry initializer configured");
      } else {
        console.warn("⚠️ Application Insights not available - tracking will be limited");
      }
    } catch (error) {
      console.error("❌ Error initializing tracking:", error);
    }

    // Track device and browser information for analytics segmentation
    this.trackDeviceInfo();
  }

  /**
   * Starts a timer to update the time-on-page display
   * 
   * This method creates a recurring timer that updates the UI every 5 seconds
   * to show how long the user has been on the current page. This is useful
   * for engagement metrics and user behavior analysis.
   */
  startSessionTimer() {
    // Update time on page every 5 seconds to show user engagement
    setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      document.getElementById("timeOnPage").textContent = timeOnPage + "s";
    }, 5000);
  }

  // ===================================================================
  // WEB METRICS IMPLEMENTATION
  // Methods for tracking basic web analytics metrics like page views,
  // visitor types, bounce rate, and time on page
  // ===================================================================

  /**
   * Tracks a page view event with comprehensive metadata
   * 
   * Page views are fundamental web analytics metrics. This method captures
   * not just the page view but also contextual information like session data,
   * timing, and whether this is the user's first page view.
   * 
   * @param {string} pageName - Name of the page being viewed (defaults to "Home")
   */
  trackPageView(pageName = "Home") {
    this.pageViewCount++;
    this.metrics.pageViews++;

    // Collect comprehensive page view data
    const pageViewData = {
      name: pageName,
      url: window.location.href,
      duration: Date.now() - this.sessionStartTime, // How long since session started
      isFirstView: this.pageViewCount === 1, // Is this the first page in the session?
    };

    // Send to Application Insights if available
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

    // Update the UI display
    document.getElementById("pageViews").textContent = this.metrics.pageViews;
    this.showStatus(`Page view tracked: ${pageName}`, "success");

    console.log("Page View Tracked:", pageViewData);
  }

  /**
   * Simulates a new visitor acquisition event
   * 
   * This method demonstrates how to track new visitor acquisition,
   * which is crucial for marketing attribution and user acquisition analysis.
   * It clears existing user data to simulate a fresh visitor experience.
   * 
   * In a real application, this would be determined by checking if
   * the user has visited before or came from a specific marketing campaign.
   */
  simulateNewVisitor() {
    // Clear existing user data to simulate new visitor
    localStorage.removeItem("app_insights_user_id");
    localStorage.removeItem("visitor_type");
    localStorage.setItem("visitor_type", "new");

    // Create event data with acquisition context
    const eventData = {
      visitorType: "new",
      timestamp: new Date().toISOString(),
      source: "organic", // In real scenarios: social, email, paid, etc.
    };

    // Track the new visitor acquisition event
    if (window.appInsights) {
      appInsights.trackEvent({
        name: "NewVisitorAcquisition",
        properties: {
          visitorType: "new",
          trafficSource: "organic", // Marketing attribution data
          sessionId: this.sessionId,
        },
      });
    }

    this.showStatus("New visitor simulation tracked", "success");
    console.log("New Visitor Simulated:", eventData);
  }

  /**
   * Simulates a returning visitor engagement event
   * 
   * Returning visitors are valuable for retention analysis. This method
   * tracks when known users return to the site and calculates how long
   * it's been since their last visit - a key retention metric.
   */
  simulateReturningVisitor() {
    localStorage.setItem("visitor_type", "returning");

    // Calculate days since last visit for retention analysis
    const lastVisit = localStorage.getItem("last_visit");
    const daysSinceLastVisit = lastVisit 
      ? Math.floor((Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24)) 
      : 0;

    const eventData = {
      visitorType: "returning",
      daysSinceLastVisit: daysSinceLastVisit,
      timestamp: new Date().toISOString(),
    };

    // Track returning visitor engagement
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

    // Update last visit timestamp for future calculations
    localStorage.setItem("last_visit", Date.now().toString());
    this.showStatus(`Returning visitor tracked (${daysSinceLastVisit} days since last visit)`, "success");
    console.log("Returning Visitor Simulated:", eventData);
  }

  /**
   * Simulates a bounce event (user leaving immediately)
   * 
   * Bounce rate is a critical web analytics metric indicating the percentage
   * of visitors who leave after viewing only one page. High bounce rates
   * may indicate poor user experience or content-audience mismatch.
   */
  simulateBounce() {
    // Collect bounce event data including session context
    const bounceData = {
      timeOnPage: Date.now() - this.sessionStartTime,
      pageViews: this.pageViewCount,
      exitReason: "immediate_exit", // Could be: no_engagement, quick_exit, etc.
    };

    // Track the bounce event with timing and context data
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

  /**
   * Tracks time spent on the current page
   * 
   * Time on page is a key engagement metric that helps understand
   * user behavior and content effectiveness. Longer time on page
   * typically indicates higher engagement with the content.
   */
  trackTimeOnPage() {
    const timeOnPage = Date.now() - this.sessionStartTime;

    // Send time on page metric to Application Insights
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

  // ===================================================================
  // PURCHASE JOURNEY IMPLEMENTATION
  // Methods for tracking e-commerce or conversion funnel events.
  // This demonstrates how to track users through a multi-step process
  // from initial interest to final conversion.
  // ===================================================================

  /**
   * Handles quote request submission (first step in purchase journey)
   * 
   * This represents the top of the conversion funnel where users express
   * initial interest. Tracking this helps measure conversion rates
   * from marketing activities to actual sales inquiries.
   */
  submitQuoteRequest() {
    // Extract form data for quote request
    const customerName = document.getElementById("customerName").value;
    const insuranceType = document.getElementById("insuranceType").value;
    const coverageAmount = document.getElementById("coverageAmount").value;

    // Validate required fields before processing
    if (!customerName || !insuranceType || !coverageAmount) {
      this.showStatus("Please fill in all fields", "error");
      return;
    }

    // Generate unique quote ID for tracking through the funnel
    this.currentQuoteId = "quote_" + Date.now();
    this.metrics.quoteRequests++;

    // Prepare quote data for tracking
    const quoteData = {
      quoteId: this.currentQuoteId,
      customerName,
      insuranceType,
      coverageAmount: parseFloat(coverageAmount),
      timestamp: new Date().toISOString(),
    };

    // Track quote request event with business context
    if (window.appInsights) {
      appInsights.trackEvent({
        name: "QuoteRequested",
        properties: {
          quoteId: this.currentQuoteId,
          insuranceType,
          sessionId: this.sessionId,
        },
        measurements: {
          coverageAmount: parseFloat(coverageAmount), // Business value metric
        },
      });
    }

    // Update UI to reflect progress and enable next step
    document.getElementById("quoteRequests").textContent = this.metrics.quoteRequests;
    document.getElementById("applicationId").value = this.currentQuoteId;
    document.getElementById("startAppBtn").disabled = false;

    this.showStatus(`Quote request submitted: ${this.currentQuoteId}`, "success");
    console.log("Quote Request:", quoteData);
  }

  /**
   * Handles application start (second step in purchase journey)
   * 
   * This represents users who move from expressing interest (quote)
   * to taking action (starting application). This is a key conversion
   * point in the funnel and helps measure user intent strength.
   */
  startApplication() {
    // Ensure prerequisite step (quote request) has been completed
    if (!this.currentQuoteId) {
      this.showStatus("Please request a quote first", "error");
      return;
    }

    // Generate unique application ID linked to the quote
    this.currentApplicationId = "app_" + Date.now();
    this.metrics.applicationsStarted++;

    // Prepare application data with funnel context
    const applicationData = {
      applicationId: this.currentApplicationId,
      quoteId: this.currentQuoteId, // Link back to original quote
      step: "started",
      timestamp: new Date().toISOString(),
    };

    // Track application start event
    if (window.appInsights) {
      appInsights.trackEvent({
        name: "ApplicationStarted",
        properties: {
          applicationId: this.currentApplicationId,
          quoteId: this.currentQuoteId,
          sessionId: this.sessionId,
        },
      });

      // Track funnel progression for conversion analysis
      appInsights.trackEvent({
        name: "FunnelStep",
        properties: {
          step: "application_started",
          funnelId: this.currentQuoteId, // Use quote ID as funnel identifier
          sessionId: this.sessionId,
        },
      });
    }

    // Update UI metrics and enable next step
    document.getElementById("applicationsStarted").textContent = this.metrics.applicationsStarted;
    document.getElementById("completeAppBtn").disabled = false;

    this.showStatus("Application started successfully", "success");
    console.log("Application Started:", applicationData);
  }

  /**
   * Handles application completion (third step in purchase journey)
   * 
   * This represents users who complete the application form, showing
   * strong purchase intent. Measuring time to complete helps identify
   * friction points in the application process.
   */
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

  // ===================================================================
  // UTILITY METHODS
  // Helper functions for UI feedback and user experience enhancement
  // ===================================================================

  /**
   * Displays status messages to the user with visual feedback
   * 
   * Provides immediate feedback for user actions, making the demo
   * more interactive and helping users understand what's happening.
   * Status messages auto-hide to avoid UI clutter.
   * 
   * @param {string} message - The message to display to the user
   * @param {string} type - Visual style: "success", "error", or default
   */
  showStatus(message, type = "success") {
    const statusDiv = document.getElementById("statusDisplay");
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = "block";

    // Auto-hide after 5 seconds to prevent UI clutter
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);
  }
}

// ===================================================================
// GLOBAL INSTANCE AND INITIALIZATION
// Manages the global analytics instance and provides initialization
// functions for different deployment scenarios
// ===================================================================

// Global instance - provides access to analytics throughout the application
let analyticsManager;

/**
 * Initializes the analytics manager after Application Insights is configured
 * 
 * This function should be called from the HTML page after Application Insights
 * has been loaded and configured. It creates the global analytics instance
 * and begins tracking with an initial page view.
 * 
 * @returns {boolean} Success status of initialization
 */
function initializeAnalytics() {
  try {
    analyticsManager = new AnalyticsManager();
    console.log("🎯 Analytics Manager initialized");

    // Track initial page view after a short delay to ensure everything is ready
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

/**
 * Legacy initialization for backwards compatibility
 * 
 * Provides fallback initialization when Application Insights is not available
 * or when the page doesn't explicitly call initializeAnalytics().
 * This ensures the demo works even in degraded conditions.
 */
document.addEventListener("DOMContentLoaded", function () {
  // Only auto-initialize if not already done by HTML and App Insights isn't available
  if (!analyticsManager && !window.appInsights) {
    console.log("🔄 Fallback: Initializing analytics without Application Insights");
    analyticsManager = new AnalyticsManager();
  }
});

// ===================================================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS
// These functions provide the interface between HTML buttons and
// the AnalyticsManager class methods. They ensure the analytics
// manager is available before calling methods.
// ===================================================================

// Web Metrics Functions
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

// Purchase Journey Functions  
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

// A/B Testing and Performance Functions
function runABTest(variant) {
  analyticsManager.runABTest(variant);
}
function measurePageLoad() {
  analyticsManager.measurePageLoad();
}
function simulateError() {
  analyticsManager.simulateError();
}

// Device and Segmentation Functions
function trackDeviceInfo() {
  analyticsManager.trackDeviceInfo();
}
function trackCustomSegment() {
  analyticsManager.trackCustomSegment();
}

// Cohort Analysis Functions
function joinCohort() {
  analyticsManager.joinCohort();
}
function trackRetention() {
  analyticsManager.trackRetention();
}
function viewCohortData() {
  analyticsManager.viewCohortData();
}
