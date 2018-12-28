import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition
} from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { IUser, Principal, UserService } from 'app/core';
import { UserProfileService } from 'app/main/pages/user-profile/user-profile.service';
import { IUserProfile } from 'app/shared/model/user-profile.model';
import { Observable } from 'rxjs';

export const MY_FORMATS = {
    parse: {
        dateInput: 'DD-MM-YYYY'
    },
    display: {
        dateInput: 'DD-MM-YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD-MM-YYYY',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};

@Component({
    selector: 'ezkr-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ]
})
export class UserProfileComponent implements OnInit {

    user: { firstName: string, lastName: string };
    userProfile: IUserProfile;
    isSaving: boolean;
    existingUserProfile = false;

    personalInformationForm: FormGroup;
    addressForm: FormGroup;
    keyInformationForm: FormGroup;

    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'top';

    constructor(private _formBuilder: FormBuilder,
                private principal: Principal,
                private userService: UserService,
                private userProfileService: UserProfileService,
                public snackBar: MatSnackBar) {
    }

    ngOnInit() {

        this.personalInformationForm = this._formBuilder.group({
            firstName: ['', Validators.required],
            middleName: [''],
            lastName: ['', Validators.required],
            fathersName: [''],
            gender: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            maritalStatus: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            secondaryEmail: ['', [Validators.email]],
            mobileNumber: ['', Validators.required]
        });

        this.keyInformationForm = this._formBuilder.group({
            panCardNumber: ['', Validators.required],
            aadharCardNumber: [''],
            bankAccountNumber: ['', Validators.required],
            ifscCode: [''],
            bankName: ['', Validators.required],
            bankBranch: ['', Validators.required]
        });

        this.addressForm = this._formBuilder.group({
            line1: ['', Validators.required],
            line2: [''],
            line3: [''],
            line4: [''],
            city: ['', Validators.required],
            state: ['', Validators.required],
            postalCode: ['', Validators.required],
            country: ['India', Validators.required]
        });

        this.loadPersonalInformation();
    }

    private loadPersonalInformation() {

        this.principal.identity().then(account => {

            this.personalInformationForm.patchValue({
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email
            });

            this.userProfileService.query({ 'userId.equals': account.id })
                .subscribe(
                    (response: HttpResponse<IUserProfile[]>) => this.onLoadSuccess(response),
                    (res: HttpErrorResponse) => this.onLoadError(res)
                );
        });
    }

    private onLoadSuccess(response: HttpResponse<IUserProfile[]>) {

        this.existingUserProfile = response && response.body && response.body.length === 1;

        if (this.existingUserProfile) {
            this.userProfile = response.body[0];
            this.personalInformationForm.patchValue({ ...this.userProfile });
        }
    }

    private onLoadError(res: HttpErrorResponse) {
        this.existingUserProfile = false;
        this.onError(res.message);
    }

    savePersonalInformation() {

        this.isSaving = true;

        this.principal.identity()
            .then(account => {

                const updatedUser = {
                    ...account,
                    firstName: this.personalInformationForm.controls.firstName.value,
                    lastName: this.personalInformationForm.controls.lastName.value,
                    email: this.personalInformationForm.controls.email.value
                };
                this.userService.update(updatedUser)
                    .subscribe(
                        (response: HttpResponse<IUser>) => {
                            this.userProfile = {
                                id: this.userProfile && this.userProfile.id,
                                middleName: this.personalInformationForm.controls.middleName.value,
                                fathersName: this.personalInformationForm.controls.fathersName.value,
                                dateOfBirth: this.personalInformationForm.controls.dateOfBirth.value,
                                gender: this.personalInformationForm.controls.gender.value,
                                maritalStatus: this.personalInformationForm.controls.maritalStatus.value,
                                mobileNumber: this.personalInformationForm.controls.mobileNumber.value,
                                secondaryEmail: this.personalInformationForm.controls.secondaryEmail.value,
                                user: response.body
                            };

                            if (this.existingUserProfile) {
                                this.subscribeToSaveResponse(this.userProfileService.update(this.userProfile));
                            } else {
                                this.subscribeToSaveResponse(this.userProfileService.create(this.userProfile));
                            }
                        },
                        (res: HttpErrorResponse) => this.onSaveError(res.message)
                    );
            });

    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IUserProfile>>) {
        result.subscribe(
            (res: HttpResponse<IUserProfile>) => this.onSaveSuccess(res.body),
            (res: HttpErrorResponse) => this.onSaveError(res.message)
        );
    }

    private onSaveSuccess(savedUserProfile) {
        this.userProfile = { ...savedUserProfile };
        this.isSaving = false;
        this.existingUserProfile = true;
    }

    private onSaveError(message) {
        this.isSaving = false;
        this.onError(message);
    }

    private onError(message) {
        this.openSnackBar(message);
    }

    openSnackBar(message) {
        this.snackBar.open(message, 'Ok', {
            announcementMessage: 'Error',
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition
        });
    }
}