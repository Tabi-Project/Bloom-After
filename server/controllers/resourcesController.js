import Resource from "../models/resource.js";
export const getALLResources = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalResources = await Resource.countDocuments();
        const totalPages = Math.ceil(totalResources / limit);
        const resources = await Resource.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            status: "success",
            data: resources,
            pagination: {
                totalResources,
                totalPages,
                currentPage: page,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ status: "error", error: "Server error" });
    }
};

export const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ status: "error", error: "Resource not found" });
        }
        res.status(200).json({ status: "success", data: resource });
    } catch (error) {
        console.error("Error fetching resource:", error);
        res.status(500).json({ status: "error", error: "Server error" });
    }
};
