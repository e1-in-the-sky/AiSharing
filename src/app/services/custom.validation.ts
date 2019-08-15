import { AbstractControl, ValidationErrors } from "@angular/forms";

export class CustomValidation {

    /**
     * バリデーションチェック対象のエラーメッセージを返却する。
     * @param validatorName
     * @param validatorValue
     * @return string
     */
    static getValidationErrorMessage(validatorName: string, validatorValue?: any) {

        let config = {
            'required': `必須項目です。`,
            'invalidEmail': 'メールアドレスの形式が正しくありません。',
            'invalidNumeric': 'コードは数字のみ使用できます。',
            'maxlength': `${validatorValue.requiredLength}字以内で入力してください。`
        };

        return config[ validatorName ]
    }

    /**
     * emailの形式に沿っているか判定する。
     * @param control
     * @return { key: true } | null
     */
    static emailValidator(control: AbstractControl): ValidationErrors | null {

        return !control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)
            ? { 'invalidEmail': true } : null;
    }

    /**
     * 数値だけかを判定する。
     * @param control
     * @return { key: true } | null
     */
    static numericValidator(control: AbstractControl): ValidationErrors | null {

        return !control.value.match(/^[0-9]+$/)
            ? { 'invalidNumeric': true } : null;
    }

}