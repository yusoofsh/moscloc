import { useIslamicDate } from "../hooks/useIslamicDate"

const IslamicCalendar: React.FC = () => {
	const { islamicDate, islamicMonth, islamicYear } = useIslamicDate()

	return (
		<div
			className="font-bold text-white text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl"
			data-testid="islamic-calendar"
		>
			<span className="font-bold text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
				{islamicDate} {islamicMonth} {islamicYear} H
			</span>
		</div>
	)
}

export default IslamicCalendar
