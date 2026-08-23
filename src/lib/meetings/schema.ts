import { z } from "zod";

export const attendeeSchema = z.object({
  name: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address"),
});

export const zoomOptionsSchema = z.object({
  waitingRoom: z.boolean(),
  joinBeforeHost: z.boolean(),
  hostVideo: z.boolean(),
  participantVideo: z.boolean(),
});

const meetingFieldsSchema = z.object({
  title: z.string().trim().min(1, "Give the meeting a title").max(200),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  location: z.string().trim().max(300).optional().or(z.literal("")),
  provider: z.enum(["google_meet", "zoom", "microsoft_teams"]),
  // ISO 8601 with an explicit offset — the client resolves the user's
  // local wall-clock time + timezone into an absolute instant before this
  // ever reaches the server, so nothing here has to guess offsets.
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  timezone: z.string().min(1, "Choose a timezone"),
  attendees: z.array(attendeeSchema).max(50, "Too many attendees"),
  zoomOptions: zoomOptionsSchema.optional(),
  /** Client-generated id so a retried/double-clicked submit doesn't create two meetings. */
  idempotencyKey: z.string().uuid(),
});

const timeOrderCheck = {
  message: "End time must be after start time",
  path: ["endTime"],
};

export const meetingInputSchema = meetingFieldsSchema.refine(
  (data) => new Date(data.endTime).getTime() > new Date(data.startTime).getTime(),
  timeOrderCheck
);
export type MeetingInputValues = z.infer<typeof meetingInputSchema>;

export const updateMeetingInputSchema = meetingFieldsSchema.extend({ meetingId: z.string().uuid() }).refine(
  (data) => new Date(data.endTime).getTime() > new Date(data.startTime).getTime(),
  timeOrderCheck
);
export type UpdateMeetingInputValues = z.infer<typeof updateMeetingInputSchema>;
