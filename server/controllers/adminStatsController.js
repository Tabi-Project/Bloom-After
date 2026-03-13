import Resource from '../models/resource.js';
import Story from '../models/story.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalResources,
      publishedResources,
      draftResources,
      totalStories,
      pendingStories,
      approvedStories,
    ] = await Promise.all([
      Resource.collection.countDocuments({}),
      Resource.collection.countDocuments({ published: true }),
      Resource.collection.countDocuments({ published: false }),
      Story.collection.countDocuments({}),
      Story.collection.countDocuments({ status: 'pending' }),
      Story.collection.countDocuments({ status: 'approved' }),
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
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
