import { InsightCards } from "./_components/insight-cards";
import { OperationalCards } from "./_components/operational-cards";
import { OverviewCards } from "./_components/overview-cards";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <OverviewCards />
      <InsightCards />
      <OperationalCards />
      {/* <TableCards /> */}
    </div>
  );
}
