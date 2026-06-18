export type StoryPrivacy = "named" | "anonymous";

export interface Story {
  _id: string;
  name: string;
  privacy: StoryPrivacy;
  image_url: string;
  story: string;
  what_helped: string[];
  location: string;
  createdAt: string;
}
