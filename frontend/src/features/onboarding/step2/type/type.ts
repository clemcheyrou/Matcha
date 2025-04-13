export type BioProps = {
	bio: string;
	handleChange: any;
}

export type GenderProps = {
	selected: string;
	setSelected: React.Dispatch<React.SetStateAction<string>>;
};