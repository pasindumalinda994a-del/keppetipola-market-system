import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime } from "@/lib/format";
import { notifications } from "@/lib/mock";
import { cn } from "@/lib/utils";

const groups = ["Applications", "Accepted Offers", "Announcements"] as const;

export default function TraderNotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Applications, accepted offers, and announcements."
      />
      <div className="space-y-8">
        {groups.map((group) => {
          const items = notifications.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <section key={group}>
              <h2 className="mb-3 text-lg font-semibold">{group}</h2>
              <ul className="space-y-3">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "rounded-xl border bg-card px-4 py-3",
                      !n.read && "border-primary/30 bg-accent/30"
                    )}
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">{n.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {n.message}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
