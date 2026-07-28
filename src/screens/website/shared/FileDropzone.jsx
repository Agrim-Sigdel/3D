import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

/**
 * A drop target with a real file input behind it.
 *
 * ─── The input stays native ──────────────────────────────────────────────────
 *
 * The one place `README.md` allows it: *"A file input is fine as long as it is
 * `hidden` with a real button in front of it, the way `Wandor` does it."* The
 * OS file dialog is not something a page should be drawing, and it cannot be
 * opened at all without a genuine `<input type="file">` receiving a real user
 * gesture. So the input is `hidden` — not `opacity-0`, which leaves an invisible
 * 200px control sitting over the design and eating clicks meant for it.
 *
 * ─── Drag counting ───────────────────────────────────────────────────────────
 *
 * `dragenter` and `dragleave` fire for every child element the pointer crosses,
 * so the naive "set true on enter, false on leave" flickers the highlight off
 * the moment the cursor passes over the icon inside the zone. The fix is a depth
 * counter: increment on enter, decrement on leave, and only consider the drag
 * gone at zero.
 *
 * ─── Validation ──────────────────────────────────────────────────────────────
 *
 * `accept` is passed to the input *and* re-checked here, because the attribute
 * only filters the file dialog — a drop bypasses it entirely. Extension and
 * MIME wildcard (`image/*`) forms are both supported, matching what the
 * attribute accepts.
 *
 * Rejections are reported through `onReject` rather than rendered, so the
 * template decides whether that is inline text, a `Toast`, or nothing.
 */

/** Matches one file against one `accept` token — `.pdf`, `image/*`, `text/csv`. */
function matches(file, token) {
    const rule = token.trim().toLowerCase();
    if (!rule) return true;
    if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
}

export default function FileDropzone({
    onChange,
    onReject,
    accept,
    multiple = false,
    /** Megabytes. `0` disables the check. */
    maxSize = 10,
    name,
    disabled = false,
    label = 'Drop a file here, or browse',
    hint,
    className = '',
    activeClassName = 'border-current',
    children,
    ...rest
}) {
    const inputRef = useRef(null);
    const depthRef = useRef(0);

    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState([]);

    const validate = list => {
        const ok = [];
        const bad = [];

        for (const file of list) {
            if (accept && !accept.split(',').some(token => matches(file, token))) {
                bad.push({ file, reason: 'type' });
            } else if (maxSize && file.size > maxSize * 1024 * 1024) {
                bad.push({ file, reason: 'size' });
            } else {
                ok.push(file);
            }
        }

        return { ok, bad };
    };

    const accepted = list => {
        const incoming = Array.from(list);
        if (!incoming.length) return;

        const { ok, bad } = validate(multiple ? incoming : incoming.slice(0, 1));
        if (bad.length) onReject?.(bad);
        if (!ok.length) return;

        const next = multiple ? [...files, ...ok] : ok;
        setFiles(next);
        onChange?.(multiple ? next : next[0]);
    };

    const remove = index => {
        const next = files.filter((_, i) => i !== index);
        setFiles(next);
        onChange?.(multiple ? next : null);
        /* Clearing the input's own value matters: without it, re-picking the
         * same file fires no `change` event and the removal cannot be undone. */
        if (inputRef.current) inputRef.current.value = '';
    };

    const open = () => {
        if (!disabled) inputRef.current?.click();
    };

    return (
        <div className={className} {...rest}>
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                hidden
                onChange={event => accepted(event.target.files)}
            />

            {/* A button, so Enter and Space open the dialog without a keydown
             * handler and the control is announced as one thing. */}
            <button
                type="button"
                onClick={open}
                disabled={disabled}
                onDragEnter={event => {
                    event.preventDefault();
                    depthRef.current += 1;
                    setDragging(true);
                }}
                onDragOver={event => {
                    /* Required. Without preventing the default here the browser
                     * navigates to the dropped file and the page is gone. */
                    event.preventDefault();
                }}
                onDragLeave={event => {
                    event.preventDefault();
                    depthRef.current -= 1;
                    if (depthRef.current <= 0) {
                        depthRef.current = 0;
                        setDragging(false);
                    }
                }}
                onDrop={event => {
                    event.preventDefault();
                    depthRef.current = 0;
                    setDragging(false);
                    if (!disabled) accepted(event.dataTransfer.files);
                }}
                data-dragging={dragging}
                className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 border border-dashed bg-transparent p-8 text-center transition-colors disabled:cursor-default disabled:opacity-40 ${
                    dragging ? activeClassName : 'border-current/25'
                }`}
            >
                {children ?? (
                    <>
                        <Upload size={20} className="opacity-60" aria-hidden="true" />
                        <span className="text-sm">{label}</span>
                        {hint && <span className="text-xs opacity-50">{hint}</span>}
                    </>
                )}
            </button>

            {files.length > 0 && (
                <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
                    {files.map((file, i) => (
                        <li
                            key={`${file.name}-${file.lastModified}`}
                            className="flex items-center justify-between gap-3 text-xs"
                        >
                            <span className="truncate opacity-80">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                aria-label={`Remove ${file.name}`}
                                className="shrink-0 cursor-pointer border-none bg-transparent p-0 opacity-50 transition-opacity hover:opacity-100"
                            >
                                <X size={13} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
