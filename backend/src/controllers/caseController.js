import Case from "../models/Case.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// POST /api/cases — client creates a case request to an advocate
export async function createCase(req, res) {
  try {
    const { title, description, caseType, advocateId, notes } = req.body;

    // Only clients can create cases
    if (req.user.role !== "client") {
      return res.status(403).json({ error: "Only clients can create cases" });
    }

    const newCase = new Case({
      title,
      description,
      caseType,
      client: req.user.id,
      advocate: advocateId || undefined,
      notes,
      status: advocateId ? "pending" : "pending",
      timeline: [
        {
          action: "Case Created",
          description: `Case "${title}" was created`,
          performedBy: req.user.id,
        },
      ],
    });

    await newCase.save();

    // Notify advocate if assigned
    if (advocateId) {
      await Notification.create({
        recipient: advocateId,
        type: "new_request",
        title: "New Case Request",
        message: `You have a new case request: "${title}"`,
        link: `/advocate/requests`,
      });
    }

    res.status(201).json(newCase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /api/cases — get cases for current user (filtered by role)
export async function getCases(req, res) {
  try {
    const { status, caseType, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (req.user.role === "client") {
      filter.client = req.user.id;
    } else if (req.user.role === "advocate") {
      filter.advocate = req.user.id;
    }
    if (status) filter.status = status;
    if (caseType) filter.caseType = caseType;

    const skip = (Number(page) - 1) * Number(limit);

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .populate("client", "name email phone")
        .populate("advocate", "name email phone")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Case.countDocuments(filter),
    ]);

    res.json({ total, page: Number(page), cases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/cases/:id — get single case detail
export async function getCaseById(req, res) {
  try {
    const c = await Case.findById(req.params.id)
      .populate("client", "name email phone profilePicture")
      .populate("advocate", "name email phone profilePicture")
      .populate("timeline.performedBy", "name role")
      .populate("documents.uploadedBy", "name");

    if (!c) return res.status(404).json({ error: "Case not found" });

    // Ensure user is part of this case
    const userId = req.user.id;
    if (
      c.client._id.toString() !== userId &&
      c.advocate?._id?.toString() !== userId
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/cases/:id/status — update case status
export async function updateCaseStatus(req, res) {
  try {
    const { status } = req.body;
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found" });

    const prevStatus = c.status;
    c.status = status;

    c.timeline.push({
      action: "Status Changed",
      description: `Status changed from "${prevStatus}" to "${status}"`,
      performedBy: req.user.id,
    });

    if (status === "resolved" || status === "closed") {
      c.outcome = req.body.outcome || "";
    }

    await c.save();

    // Notify the other party
    const recipientId =
      req.user.id === c.client.toString() ? c.advocate : c.client;

    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        type: "case_update",
        title: "Case Status Updated",
        message: `Case "${c.title}" is now "${status}"`,
        link:
          req.user.role === "client"
            ? `/advocate/cases/${c._id}`
            : `/client/cases/${c._id}`,
      });
    }

    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// POST /api/cases/:id/timeline — add a timeline entry
export async function addTimelineEntry(req, res) {
  try {
    const { action, description } = req.body;
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found" });

    c.timeline.push({
      action,
      description,
      performedBy: req.user.id,
    });

    await c.save();
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /api/cases/history — case history with filters
export async function getCaseHistory(req, res) {
  try {
    const { caseType, fromDate, toDate, page = 1, limit = 20 } = req.query;

    const filter = {
      status: { $in: ["resolved", "closed"] },
    };

    if (req.user.role === "client") {
      filter.client = req.user.id;
    } else {
      filter.advocate = req.user.id;
    }

    if (caseType) filter.caseType = caseType;
    if (fromDate || toDate) {
      filter.updatedAt = {};
      if (fromDate) filter.updatedAt.$gte = new Date(fromDate);
      if (toDate) filter.updatedAt.$lte = new Date(toDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .populate("client", "name email")
        .populate("advocate", "name email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Case.countDocuments(filter),
    ]);

    res.json({ total, page: Number(page), cases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/requests — advocate sees incoming pending requests
export async function getRequests(req, res) {
  try {
    if (req.user.role !== "advocate") {
      return res.status(403).json({ error: "Only advocates can view requests" });
    }

    const requests = await Case.find({
      advocate: req.user.id,
      status: "pending",
    })
      .populate("client", "name email phone profilePicture")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/requests/:id/accept
export async function acceptRequest(req, res) {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found" });

    if (c.advocate?.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not your request" });
    }

    c.status = "active";
    c.timeline.push({
      action: "Request Accepted",
      description: "Advocate accepted the case",
      performedBy: req.user.id,
    });

    await c.save();

    await Notification.create({
      recipient: c.client,
      type: "request_accepted",
      title: "Request Accepted!",
      message: `Your case "${c.title}" has been accepted by the advocate`,
      link: `/client/cases/${c._id}`,
    });

    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PUT /api/requests/:id/reject
export async function rejectRequest(req, res) {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found" });

    if (c.advocate?.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not your request" });
    }

    c.status = "closed";
    c.advocate = undefined;
    c.timeline.push({
      action: "Request Rejected",
      description: req.body.reason || "Advocate declined the case",
      performedBy: req.user.id,
    });

    await c.save();

    await Notification.create({
      recipient: c.client,
      type: "request_rejected",
      title: "Request Declined",
      message: `Your case request "${c.title}" was declined. You can search for another advocate.`,
      link: `/client/cases`,
    });

    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /api/cases/stats — dashboard stats for current user
export async function getCaseStats(req, res) {
  try {
    const filter = {};
    if (req.user.role === "client") {
      filter.client = req.user.id;
    } else {
      filter.advocate = req.user.id;
    }

    const [active, pending, resolved, closed, total] = await Promise.all([
      Case.countDocuments({ ...filter, status: "active" }),
      Case.countDocuments({ ...filter, status: "pending" }),
      Case.countDocuments({ ...filter, status: "resolved" }),
      Case.countDocuments({ ...filter, status: "closed" }),
      Case.countDocuments(filter),
    ]);

    const recentCases = await Case.find(filter)
      .populate("client", "name")
      .populate("advocate", "name")
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({ active, pending, resolved, closed, total, recentCases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
