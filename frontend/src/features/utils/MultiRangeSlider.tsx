import {
	ChangeEvent,
	FC,
	useCallback,
	useEffect,
	useState,
	useRef,
} from "react";
import classnames from "classnames";
import React from "react";

interface MultiRangeSliderProps {
	min: number;
	max: number;
	onChange: Function;
}

// https://codesandbox.io/p/sandbox/b9l0g?file=%2Fsrc%2FmultiRangeSlider%2FMultiRangeSlider.tsx%3A1%2C1-107%2C1
export const MultiRangeSlider: FC<MultiRangeSliderProps> = ({
	min,
	max,
	onChange
  }) => {
	const [minVal, setMinVal] = useState(min);
	const [maxVal, setMaxVal] = useState(max);
	const minValRef = useRef<HTMLInputElement>(null);
	const maxValRef = useRef<HTMLInputElement>(null);
	const range = useRef<HTMLDivElement>(null);
  
	const getPercent = useCallback(
	  (value: number) => Math.round(((value - min) / (max - min)) * 100),
	  [min, max]
	);
  
	useEffect(() => {
	  if (maxValRef.current) {
		const minPercent = getPercent(minVal);
		const maxPercent = getPercent(+maxValRef.current.value); // Precede with '+' to convert the value from type string to type number
  
		if (range.current) {
		  range.current.style.left = `${minPercent}%`;
		  range.current.style.width = `${maxPercent - minPercent}%`;
		}
	  }
	}, [minVal, getPercent]);
  
	useEffect(() => {
	  if (minValRef.current) {
		const minPercent = getPercent(+minValRef.current.value);
		const maxPercent = getPercent(maxVal);
  
		if (range.current) {
		  range.current.style.width = `${maxPercent - minPercent}%`;
		}
	  }
	}, [maxVal, getPercent]);
  
	useEffect(() => {
	  onChange({ min: minVal, max: maxVal });
	}, [minVal, maxVal, onChange]);
  
	return (
	  <div className="h-6">
		<input
		  type="range"
		  min={min}
		  max={max}
		  value={minVal}
		  ref={minValRef}
		  onChange={(event: ChangeEvent<HTMLInputElement>) => {
			const value = Math.min(+event.target.value, maxVal - 1);
			setMinVal(value);
			event.target.value = value.toString();
		  }}
		  className={classnames("thumb thumb--zindex-3", {
			"thumb--zindex-5": minVal > max - 100
		  })}
		/>
		<input
		  type="range"
		  min={min}
		  max={max}
		  value={maxVal}
		  ref={maxValRef}
		  onChange={(event: ChangeEvent<HTMLInputElement>) => {
			const value = Math.max(+event.target.value, minVal + 1);
			setMaxVal(value);
			event.target.value = value.toString();
		  }}
		  className="thumb thumb--zindex-4"
		/>
  
		<div className="slider">
		  <div className="slider__track"></div>
		  <div ref={range} className="slider__range"></div>
		</div>
	  </div>
	);
};
  