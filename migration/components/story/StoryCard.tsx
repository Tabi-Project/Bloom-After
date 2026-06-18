import { Story } from "@/types/story";
import Image from "next/image";
const StoryCard = ({ story }: { story: Story }) => {
  const {
    name,
    location,
    createdAt,
    _id,
    what_helped,
    image_url,
    privacy,
    story: storyText,
  } = story;

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80';
  const plainText = story.story_text || (story.story ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const excerpt = plainText && plainText.length > 130 ? plainText.slice(0, 130).trim() + '…' : plainText;
  const img     = image_url || FALLBACK_IMAGE;
  const tags    = what_helped.slice(0, 3);
  return (
    <article className="resource-card story-card" data-id={_id}>
      <a
        href={`/stories/detail?id=${_id}`}
        className="resource-card-image-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        {img && (
          <figure className="resource-card-image">
            <Image
              src={img}
              alt=""
              width={400}
              height={240}
              loading="lazy"
              quality={60}
              priority={false}
            />
          </figure>
        )}
      </a>

      <div className="resource-card-body">
        <div className="resource-card-meta">
          {createdAt && (
            <time dateTime={createdAt}>
              {new Date(createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          )}
          <span className="story-location">{location}</span>
        </div>

        <p className="story-author">
          By {privacy === "anonymous" ? "Anonymous" : name}
        </p>
        <p className="resource-card-summary">{excerpt}</p>

        <div className="story-card-tags" aria-label="What helped">
          {tags.map((tag) => (
            <span key={tag} className="review-tag">
              {tag}
            </span>
          ))}
        </div>

        <a
          href={`/stories/${_id}`}
          className="resource-card-cta"
          aria-label={`Read story by ${name}`}
        >
          Read story
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </article>
  );
};
export default StoryCard;
