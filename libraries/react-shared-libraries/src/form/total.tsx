import { FC, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { useFormContext } from 'react-hook-form';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
export const Total: FC<{
  name: string;
  customOnChange?: () => void;
}> = (props) => {
  const { name, customOnChange } = props;
  const form = useFormContext();
  const value = form.watch(props.name);
  const changeNumber = useCallback(
    (value: number) => () => {
      if (value === 0) {
        return;
      }
      form.setValue(name, value);
    },
    [value]
  );
  useEffect(() => {
    if (customOnChange) {
      customOnChange();
    }
  }, [value, customOnChange]);

  const t = useT();

  return (
    <div className="flex flex-col gap-[6px] relative w-[158px]">
      <div className={`text-[14px]`}>{t('total', 'Total')}</div>
      <div
        className={clsx(
          'bg-input h-[44px] border-fifth border rounded-[4px] text-inputText placeholder-inputText items-center justify-center flex'
        )}
      >
        <div className="flex-1 px-[16px] text-[14px] select-none flex gap-[8px] items-center">
          <div onClick={changeNumber(value - 1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M11 8C11 8.13261 10.9473 8.25979 10.8536 8.35355C10.7598 8.44732 10.6326 8.5 10.5 8.5H5.5C5.36739 8.5 5.24022 8.44732 5.14645 8.35355C5.05268 8.25979 5 8.13261 5 8C5 7.86739 5.05268 7.74021 5.14645 7.64645C5.24022 7.55268 5.36739 7.5 5.5 7.5H10.5C10.6326 7.5 10.7598 7.55268 10.8536 7.64645C10.9473 7.74021 11 7.86739 11 8ZM14.5 8C14.5 9.28558 14.1188 10.5423 13.4046 11.6112C12.6903 12.6801 11.6752 13.5132 10.4874 14.0052C9.29973 14.4972 7.99279 14.6259 6.73192 14.3751C5.47104 14.1243 4.31285 13.5052 3.40381 12.5962C2.49477 11.6872 1.8757 10.529 1.6249 9.26809C1.37409 8.00721 1.50282 6.70028 1.99479 5.51256C2.48676 4.32484 3.31988 3.30968 4.3888 2.59545C5.45772 1.88122 6.71442 1.5 8 1.5C9.72335 1.50182 11.3756 2.18722 12.5942 3.40582C13.8128 4.62441 14.4982 6.27665 14.5 8ZM13.5 8C13.5 6.9122 13.1774 5.84883 12.5731 4.94436C11.9687 4.03989 11.1098 3.33494 10.1048 2.91866C9.09977 2.50238 7.9939 2.39346 6.92701 2.60568C5.86011 2.8179 4.8801 3.34172 4.11092 4.11091C3.34173 4.8801 2.8179 5.86011 2.60568 6.927C2.39347 7.9939 2.50238 9.09977 2.91867 10.1048C3.33495 11.1098 4.0399 11.9687 4.94437 12.5731C5.84884 13.1774 6.91221 13.5 8 13.5C9.45819 13.4983 10.8562 12.9184 11.8873 11.8873C12.9184 10.8562 13.4983 9.45818 13.5 8Z"
                fill={value === 1 ? '#64748B' : 'white'}
              />
            </svg>
          </div>
          <div className="flex-1 text-white text-[14px] text-center">
            {value}
          </div>
          <div onClick={changeNumber(value + 1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM8 13.5C6.91221 13.5 5.84884 13.1774 4.94437 12.5731C4.0399 11.9687 3.33495 11.1098 2.91867 10.1048C2.50238 9.09977 2.39347 7.9939 2.60568 6.927C2.8179 5.86011 3.34173 4.8801 4.11092 4.11091C4.8801 3.34172 5.86011 2.8179 6.92701 2.60568C7.9939 2.39346 9.09977 2.50238 10.1048 2.91866C11.1098 3.33494 11.9687 4.03989 12.5731 4.94436C13.1774 5.84883 13.5 6.9122 13.5 8C13.4983 9.45818 12.9184 10.8562 11.8873 11.8873C10.8562 12.9184 9.45819 13.4983 8 13.5ZM11 8C11 8.13261 10.9473 8.25979 10.8536 8.35355C10.7598 8.44732 10.6326 8.5 10.5 8.5H8.5V10.5C8.5 10.6326 8.44732 10.7598 8.35356 10.8536C8.25979 10.9473 8.13261 11 8 11C7.86739 11 7.74022 10.9473 7.64645 10.8536C7.55268 10.7598 7.5 10.6326 7.5 10.5V8.5H5.5C5.36739 8.5 5.24022 8.44732 5.14645 8.35355C5.05268 8.25979 5 8.13261 5 8C5 7.86739 5.05268 7.74021 5.14645 7.64645C5.24022 7.55268 5.36739 7.5 5.5 7.5H7.5V5.5C7.5 5.36739 7.55268 5.24021 7.64645 5.14645C7.74022 5.05268 7.86739 5 8 5C8.13261 5 8.25979 5.05268 8.35356 5.14645C8.44732 5.24021 8.5 5.36739 8.5 5.5V7.5H10.5C10.6326 7.5 10.7598 7.55268 10.8536 7.64645C10.9473 7.74021 11 7.86739 11 8Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
