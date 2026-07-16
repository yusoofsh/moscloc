import type React from "react"
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"

export interface SelectOption {
	value: string
	label: string
}

interface CommonFieldProps {
	id: string
	label: string
	description?: React.ReactNode
	error?: string
	fieldClassName?: string
}

type TextInputFieldProps = CommonFieldProps &
	Omit<React.ComponentProps<typeof Input>, "id">

type TextareaFieldProps = CommonFieldProps &
	Omit<React.ComponentProps<typeof Textarea>, "id">

interface SelectFieldProps extends Omit<CommonFieldProps, "error"> {
	value: string
	options: SelectOption[]
	onValueChange: (value: string) => void
	name?: string
}

export function TextInputField({
	id,
	label,
	description,
	error,
	fieldClassName,
	...props
}: TextInputFieldProps) {
	const errorId = `${id}-error`
	return (
		<Field className={fieldClassName} data-invalid={Boolean(error)}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Input
				id={id}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? errorId : undefined}
				{...props}
			/>
			{error && (
				<p id={errorId} className="text-destructive text-sm">
					{error}
				</p>
			)}
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	)
}

export function TextareaField({
	id,
	label,
	description,
	error,
	fieldClassName,
	...props
}: TextareaFieldProps) {
	const errorId = `${id}-error`
	return (
		<Field className={fieldClassName} data-invalid={Boolean(error)}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Textarea
				id={id}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? errorId : undefined}
				{...props}
			/>
			{error && (
				<p id={errorId} className="text-destructive text-sm">
					{error}
				</p>
			)}
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	)
}

export function SelectField({
	id,
	label,
	value,
	options,
	onValueChange,
	description,
	name,
}: SelectFieldProps) {
	const labelId = `${id}-label`
	return (
		<Field>
			<FieldLabel id={labelId}>{label}</FieldLabel>
			<Select name={name} value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} aria-labelledby={labelId} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	)
}
