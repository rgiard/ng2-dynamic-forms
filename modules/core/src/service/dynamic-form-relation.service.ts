import { Injectable } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import {
    DynamicFormControlRelation,
    DynamicFormControlRelationGroup,
    DYNAMIC_FORM_CONTROL_ACTION_DISABLE,
    DYNAMIC_FORM_CONTROL_ACTION_ENABLE,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_AND,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_OR
} from "../model/dynamic-form-control-relation.model";

@Injectable()
export class DynamicFormRelationService {

    constructor() {}

    findActivationRelation(relGroups: Array<DynamicFormControlRelationGroup>): DynamicFormControlRelationGroup {
        return relGroups.find(rel => rel.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE || rel.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE);
    }

    getRelatedFormControls(model: DynamicFormControlModel, controlGroup: FormGroup): Array<FormControl> {

        let controls: Array<FormControl> = [];

        model.relation.forEach(relGroup => relGroup.when.forEach(rel => {

            if (model.id === rel.id) {
                throw new Error(`FormControl ${model.id} cannot depend on itself`);
            }

            let control = <FormControl> controlGroup.get(rel.id);

            if (control && !controls.some(controlElement => controlElement === control)) {
                controls.push(control);
            }
        }));

        return controls;
    }

    isFormControlToBeDisabled(relGroup: DynamicFormControlRelationGroup, formGroup: FormGroup): boolean {

        return relGroup.when.reduce((toBeDisabled: boolean, rel: DynamicFormControlRelation, index: number) => {

            let control = formGroup.get(rel.id);

            if (control && relGroup.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE) {

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && !toBeDisabled) {
                    return false;
                }

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && toBeDisabled) {
                    return true;
                }

                return rel.value === control.value || rel.status === control.status;
            }

            if (control && relGroup.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE) {

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && toBeDisabled) {
                    return true;
                }

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && !toBeDisabled) {
                    return false;
                }

                return !(rel.value === control.value || rel.status === control.status);
            }

            return false;

        }, false);
    }
}