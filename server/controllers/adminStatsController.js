import Resource from '../models/resource.js';
import Story from '../models/story.js';
import NGO from '../models/ngo.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalResources,
      publishedResources,
      draftResources,
      totalStories,
      pendingStories,
      approvedStories,
      totalNgos,
      pendingNgos,
      approvedNgos,
    ] = await Promise.all([
      Resource.collection.countDocuments({}),
      Resource.collection.countDocuments({ published: true }),
      Resource.collection.countDocuments({ published: false }),
      Story.collection.countDocuments({}),
      Story.collection.countDocuments({ status: 'pending' }),
      Story.collection.countDocuments({ status: { $in: ['approved', 'accepted'] } }),
      NGO.countDocuments({}),
      NGO.countDocuments({ status: 'pending' }),
      NGO.countDocuments({ status: 'approved' }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        resources: {
          total: totalResources,
          published: publishedResources,
          drafts: draftResources,
        },
        stories: {
          total: totalStories,
          pending: pendingStories,
          approved: approvedStories,
        },
        ngos: {
          total: totalNgos,
          pending: pendingNgos,
          approved: approvedNgos,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
