import { MessageCircle, UserX, Users } from "lucide-react";

export function NoAssignmentEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <UserX className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-medium">No one is assigned yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Messaging will become available once a team member is assigned to your project.
        </p>
      </div>
    </div>
  );
}

export function NoConversationSelectedEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Users className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-medium">Select a conversation</h3>
        <p className="max-w-sm text-sm text-muted-foreground">Choose a client from the list to view the conversation.</p>
      </div>
    </div>
  );
}

export function NoConversationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Users className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-medium">No conversations yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Conversations appear here once a client is assigned to a team member.
        </p>
      </div>
    </div>
  );
}

export function StartConversationEmptyState({ personName }: { personName: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <MessageCircle className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-medium">Start a conversation</h3>
        <p className="max-w-sm text-sm text-muted-foreground">Send a message to {personName} to get started.</p>
      </div>
    </div>
  );
}
