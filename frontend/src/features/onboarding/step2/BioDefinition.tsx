import React from 'react'

type Props = {
	bio: string;
	handleChange: any;
}

export const BioDefinition: React.FC<Props> = ({bio, handleChange}) => {
  return (
	<div className="mt-4">
		<h2>Bio</h2>
		<textarea
			value={bio}
			onChange={handleChange}
			className="mt-2 w-full py-2 px-3 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink focus:border-pink text-gray-800 h-32"
			placeholder="Write your message here..."
		></textarea>
	</div>  
	)
}
