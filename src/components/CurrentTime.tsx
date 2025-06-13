import { format } from "date-fns";
import { id } from "date-fns/locale";
import type React from "react";
import { useEffect, useState } from "react";

const CurrentTime: React.FC = () => {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="text-right">
			<div className="mb-3 font-bold font-mono text-4xl text-white lg:text-5xl xl:text-6xl 2xl:text-7xl">
				{format(currentTime, "HH:mm")}
			</div>
			<div className="font-bold text-white text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
				{format(currentTime, "EEEE, dd MMMM yyyy", { locale: id })}
			</div>
		</div>
	);
};

export default CurrentTime;
