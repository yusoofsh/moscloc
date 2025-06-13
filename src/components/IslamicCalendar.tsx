import { Calendar } from "lucide-react";
import { useIslamicDate } from "../hooks/useIslamicDate";

const IslamicCalendar: React.FC = () => {
	const { islamicDate, islamicMonth, islamicYear } = useIslamicDate();

	return (
		<div className="mt-3 flex items-center gap-3 text-white">
			<Calendar size={26} />
			<span className="font-bold text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
				{islamicDate} {islamicMonth} {islamicYear} H
			</span>
		</div>
	);
};

export default IslamicCalendar;
